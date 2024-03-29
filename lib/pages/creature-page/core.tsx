import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { SvgVocabulary, SvgVocabularyWithBlank } from "../../svg-vocabulary";
import {
  EMPTY_SVG_SYMBOL_DATA,
  noFillIfShowingSpecs,
  SvgSymbolData,
} from "../../svg-symbol";
import {
  AttachmentPointType,
  ATTACHMENT_POINT_TYPES,
  iterAttachmentPoints,
} from "../../specs";
import { Random } from "../../random";
import { range } from "../../util";

import { AutoSizingSvg } from "../../auto-sizing-svg";
import { AnimationRenderer, ExportWidget } from "../../export-svg";
import {
  CreatureContext,
  CreatureContextType,
  CreatureSymbol,
  NestedCreatureSymbol,
} from "../../creature-symbol";
import { HoverDebugHelper } from "../../hover-debug-helper";
import { svgScale, SvgTransform } from "../../svg-transform";
import { NumericSlider } from "../../numeric-slider";
import { Checkbox } from "../../checkbox";
import {
  CompositionContextWidget,
  createSvgCompositionContext,
  SvgCompositionContext,
} from "../../svg-composition-context";
import { Page } from "../../page";
import { RandomizerWidget } from "../../randomizer-widget";
import { VocabularyWidget } from "../../vocabulary-widget";
import { createDistribution } from "../../distribution";
import { ComponentWithShareableStateProps } from "../../page-with-shareable-state";
import { useDebouncedEffect } from "../../use-debounced-effect";
import { useRememberedState } from "../../use-remembered-state";
import { GalleryWidget } from "../../gallery-widget";
import { serializeCreatureDesign } from "./serialization";
import { CreatureEditorWidget } from "./creature-editor";
import { useAnimationPct } from "../../animation";
import {
  CreatureAnimatorName,
  CreatureAnimators,
  CREATURE_ANIMATOR_NAMES,
} from "../../creature-animator";

/**
 * The minimum number of attachment points that any symbol used as the main body
 * of a creature must have.
 *
 * Note that this number is inclusive of a symbol's anchor point.
 */
const MIN_ROOT_ATTACHMENT_POINTS = 2;

const getFilteredDistribution = (predicate: (item: SvgSymbolData) => boolean) =>
  createDistribution(
    SvgVocabulary.items.filter(predicate),
    (s) => s.meta?.creature_frequency_multiplier ?? 1
  );

/** Symbols that can be the "root" (i.e., main body) of a creature. */
const ROOT_SYMBOLS = getFilteredDistribution(
  (data) =>
    data.meta?.always_be_nested !== true &&
    Array.from(iterAttachmentPoints(data.specs || {})).length >=
      MIN_ROOT_ATTACHMENT_POINTS
);

type AttachmentSymbolMap = {
  [key in AttachmentPointType]: SvgSymbolData[];
};

/**
 * Symbols that can be attached to the main body of a creature,
 * at a particular attachment point.
 */
const ATTACHMENT_SYMBOLS: AttachmentSymbolMap = (() => {
  const result = {} as AttachmentSymbolMap;

  for (let type of ATTACHMENT_POINT_TYPES) {
    result[type] = getFilteredDistribution((data) => {
      const { meta } = data;

      if (type === "wildcard") {
        // The wildcard attachment point type can have anything!
        return true;
      }

      // If we have no metadata whatsoever, it can attach anywhere.
      if (!meta) return true;

      if (meta.always_be_nested === true) {
        // This symbol should *only* ever be nested, so return false.
        return false;
      }

      // If we have no "attach_to", it can attach anywhere.
      if (!meta.attach_to) {
        return true;
      }

      // Only attach to points listed in "attach_to".
      return meta.attach_to.includes(type);
    });
  }

  return result;
})();

/** Symbols that can be nested within any part of a creature. */
const NESTED_SYMBOLS = getFilteredDistribution(
  // Since we don't currently support recursive nesting, ignore anything that
  // wants nested children.
  (data) =>
    data.meta?.always_nest !== true && data.meta?.never_be_nested !== true
);

/**
 * Given a parent symbol, return an array of random children to be nested within
 * it.
 *
 * Can return an empty array e.g. if the parent symbol doesn't have
 * any nesting areas.
 */
function getNestingChildren(
  parent: SvgSymbolData,
  rng: Random,
  preferNesting?: boolean
): NestedCreatureSymbol[] {
  const { meta, specs } = parent;
  if ((meta?.always_nest || preferNesting) && specs?.nesting) {
    const indices = range(specs.nesting.length);
    const child = rng.choice(NESTED_SYMBOLS);
    return [
      {
        data: child,
        attachments: [],
        nests: [],
        indices,
        invertColors: meta?.invert_nested ?? false,
      },
    ];
  }
  return [];
}

/**
 * Randomly creates a symbol with the given number of
 * types of attachments.  The symbol itself, and where the
 * attachments are attached, are chosen randomly.
 */
function getSymbolWithAttachments(
  numAttachmentKinds: number,
  { rng, randomlyInvert: randomlyInvertSymbols }: CreatureGeneratorOptions
): CreatureSymbol {
  const root = rng.choice(ROOT_SYMBOLS);
  const randomlyInvertRng = rng.clone();
  const shouldInvert = () =>
    randomlyInvertSymbols ? randomlyInvertRng.bool() : false;
  const result: CreatureSymbol = {
    data: root,
    attachments: [],
    nests: getNestingChildren(root, rng, true),
    invertColors: shouldInvert(),
  };
  if (root.specs) {
    const attachmentKinds = rng.uniqueChoices(
      Array.from(iterAttachmentPoints(root.specs))
        .filter((point) => point.type !== "anchor")
        .map((point) => point.type),
      numAttachmentKinds
    );
    for (let kind of attachmentKinds) {
      const attachment = rng.choice(ATTACHMENT_SYMBOLS[kind]);
      const indices = range(root.specs[kind]?.length ?? 0);
      result.attachments.push({
        data: attachment,
        attachTo: kind,
        indices,
        attachments: [],
        nests: getNestingChildren(attachment, rng),
        invertColors: shouldInvert(),
      });
    }
  }
  return result;
}

type CreatureGeneratorOptions = {
  rng: Random;
  randomlyInvert: boolean;
};

type CreatureGenerator = (options: CreatureGeneratorOptions) => CreatureSymbol;

/**
 * Each index of this array represents the algorithm we use to
 * randomly construct a creature with a particular "complexity level".
 *
 * For instance, the algorithm used to create a creature with
 * complexity level 0 will be the first item of this array.
 */
const COMPLEXITY_LEVEL_GENERATORS: CreatureGenerator[] = [
  ...range(5).map((i) => getSymbolWithAttachments.bind(null, i)),
];

const MAX_COMPLEXITY_LEVEL = COMPLEXITY_LEVEL_GENERATORS.length - 1;

const INITIAL_COMPLEXITY_LEVEL = 2;

function getDownloadBasename(rootSymbolName: string) {
  return `mystic-symbolic-creature-${rootSymbolName}`;
}

function creatureHasSymbol(
  creature: CreatureSymbol,
  symbol: SvgSymbolData
): boolean {
  if (creature.data === symbol) return true;
  if (creature.attachments.some((a) => creatureHasSymbol(a, symbol)))
    return true;
  return creature.nests.some((n) => creatureHasSymbol(n, symbol));
}

function repeatUntilSymbolIsIncluded(
  symbol: SvgSymbolData,
  rng: Random,
  createCreature: (rng: Random) => CreatureSymbol,
  maxAttempts = 10_000
): CreatureSymbol {
  if (symbol === EMPTY_SVG_SYMBOL_DATA) return createCreature(rng);

  for (let i = 0; i < maxAttempts; i++) {
    const creature = createCreature(rng);
    if (creatureHasSymbol(creature, symbol)) return creature;
  }

  // We don't want to hold up the UI forever so just log a message and
  // return *something*.

  console.log(
    `Tried to create a creature with the ${symbol.name} symbol ` +
      `but gave up after ${maxAttempts} attempts.`
  );

  return createCreature(rng);
}

export type CreatureDesign = {
  animatorName: CreatureAnimatorName;
  compCtx: SvgCompositionContext;
  creature: CreatureSymbol;
};

export const CREATURE_DESIGN_DEFAULTS: CreatureDesign = {
  animatorName: "none",
  compCtx: createSvgCompositionContext(),
  creature: {
    data: ROOT_SYMBOLS[0],
    invertColors: false,
    attachments: [],
    nests: [],
  },
};

type AnimationWidgetProps = {
  value: CreatureAnimatorName;
  onChange: (name: CreatureAnimatorName) => void;
};

const AnimationWidget: React.FC<AnimationWidgetProps> = (props) => {
  const id = "animationName";
  return (
    <div className="flex-widget thingy">
      <label htmlFor={id}>Animation:</label>
      <select
        id={id}
        onChange={(e) => props.onChange(e.target.value as CreatureAnimatorName)}
        value={props.value}
      >
        {CREATURE_ANIMATOR_NAMES.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
    </div>
  );
};

export const CreaturePageWithDefaults: React.FC<
  ComponentWithShareableStateProps<CreatureDesign>
> = ({ defaults, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animatorName, setAnimatorName] = useState(defaults.animatorName);
  const isAnimated = animatorName !== "none";
  const [randomlyInvert, setRandomlyInvert] = useRememberedState(
    "creature-page:randomlyInvert",
    true
  );
  const [compCtx, setCompCtx] = useState(defaults.compCtx);
  const [complexity, setComplexity] = useRememberedState(
    "creature-page:complexity",
    INITIAL_COMPLEXITY_LEVEL
  );
  const [creature, setCreature] = useState(defaults.creature);
  const defaultCtx = useContext(CreatureContext);
  const newRandomCreature = () => {
    setCreature(
      repeatUntilSymbolIsIncluded(
        alwaysInclude,
        new Random(Date.now()),
        (rng) =>
          COMPLEXITY_LEVEL_GENERATORS[complexity]({
            rng,
            randomlyInvert,
          })
      )
    );
  };
  const ctx: CreatureContextType = noFillIfShowingSpecs({
    ...defaultCtx,
    ...compCtx,
  });
  const [alwaysInclude, setAlwaysInclude] = useRememberedState<SvgSymbolData>(
    "creature-page:alwaysInclude",
    EMPTY_SVG_SYMBOL_DATA
  );
  const design: CreatureDesign = useMemo(
    () => ({
      animatorName,
      creature,
      compCtx,
    }),
    [creature, compCtx, animatorName]
  );

  useDebouncedEffect(
    250,
    useCallback(() => onChange(design), [onChange, design])
  );

  const render = useMemo(
    () =>
      createCreatureAnimationRenderer(creature, ctx, undefined, animatorName),
    [creature, ctx, animatorName]
  );

  return (
    <Page title="Cluster!">
      <div className="sidebar">
        <CompositionContextWidget ctx={compCtx} onChange={setCompCtx} />
        <CreatureEditorWidget creature={creature} onChange={setCreature} />
        <AnimationWidget value={animatorName} onChange={setAnimatorName} />
        <RandomizerWidget
          onColorsChange={(colors) => setCompCtx({ ...compCtx, ...colors })}
          onSymbolsChange={newRandomCreature}
        >
          <div className="thingy">
            <VocabularyWidget
              label="Always include this symbol"
              value={alwaysInclude}
              onChange={setAlwaysInclude}
              choices={SvgVocabularyWithBlank}
            />
          </div>
          <div className="thingy">
            <NumericSlider
              label="Random cluster complexity"
              min={0}
              max={MAX_COMPLEXITY_LEVEL}
              step={1}
              value={complexity}
              onChange={setComplexity}
            />
          </div>
          <div className="thingy">
            <Checkbox
              label="Randomly invert symbols"
              value={randomlyInvert}
              onChange={setRandomlyInvert}
            />
          </div>
        </RandomizerWidget>
        <GalleryWidget
          kind="creature"
          serializeValue={() => serializeCreatureDesign(design)}
        />
        <div className="thingy">
          <ExportWidget
            basename={getDownloadBasename(creature.data.name)}
            svgRef={svgRef}
            animate={isAnimated && { duration: ANIMATION_PERIOD_MS, render }}
          />
        </div>
      </div>
      <CreatureCanvas
        compCtx={compCtx}
        render={render}
        ref={svgRef}
        isAnimated={isAnimated}
      />
    </Page>
  );
};

function createCreatureAnimationRenderer(
  creature: CreatureSymbol,
  ctx: CreatureContextType,
  scale = 0.5,
  animatorName: CreatureAnimatorName = "none"
): AnimationRenderer {
  return (animPct) => {
    return (
      <SvgTransform transform={svgScale(scale)}>
        <CreatureContext.Provider value={ctx}>
          <CreatureSymbol
            {...creature}
            animPct={animPct}
            animator={CreatureAnimators[animatorName]}
          />
        </CreatureContext.Provider>
      </SvgTransform>
    );
  };
}

type CreatureCanvasProps = {
  isAnimated: boolean;
  compCtx: SvgCompositionContext;
  render: AnimationRenderer;
};

const ANIMATION_PERIOD_MS = 5000;

const CreatureCanvas = React.forwardRef<SVGSVGElement, CreatureCanvasProps>(
  ({ isAnimated, compCtx, render }, svgRef) => {
    const animPct = useAnimationPct(isAnimated ? ANIMATION_PERIOD_MS : 0);

    return (
      <div className="canvas" style={{ backgroundColor: compCtx.background }}>
        <HoverDebugHelper>
          <AutoSizingSvg
            padding={100}
            ref={svgRef}
            resizeKey={render}
            bgColor={compCtx.background}
          >
            {render(animPct)}
          </AutoSizingSvg>
        </HoverDebugHelper>
      </div>
    );
  }
);
