import React, { useContext, useMemo, useRef, useState } from "react";
import { SvgVocabulary, SvgVocabularyWithBlank } from "../svg-vocabulary";
import {
  EMPTY_SVG_SYMBOL_DATA,
  noFillIfShowingSpecs,
  SvgSymbolData,
} from "../svg-symbol";
import {
  AttachmentPointType,
  ATTACHMENT_POINT_TYPES,
  iterAttachmentPoints,
} from "../specs";
import { Random } from "../random";
import { range } from "../util";

import { AutoSizingSvg } from "../auto-sizing-svg";
import { ExportWidget } from "../export-svg";
import {
  CreatureContext,
  CreatureContextType,
  CreatureSymbol,
  NestedCreatureSymbol,
} from "../creature-symbol";
import { HoverDebugHelper } from "../hover-debug-helper";
import { svgScale, SvgTransform } from "../svg-transform";
import { NumericSlider } from "../numeric-slider";
import { Checkbox } from "../checkbox";
import {
  CompositionContextWidget,
  createSvgCompositionContext,
} from "../svg-composition-context";
import { Page } from "../page";
import { RandomizerWidget } from "../randomizer-widget";
import { VocabularyWidget } from "../vocabulary-widget";
import { createDistribution } from "../distribution";

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

function getDownloadBasename(randomSeed: number) {
  return `mystic-symbolic-creature-${randomSeed}`;
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

export const CreaturePage: React.FC<{}> = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [randomSeed, setRandomSeed] = useState<number>(Date.now());
  const [randomlyInvert, setRandomlyInvert] = useState(true);
  const [compCtx, setCompCtx] = useState(createSvgCompositionContext());
  const [complexity, setComplexity] = useState(INITIAL_COMPLEXITY_LEVEL);
  const defaultCtx = useContext(CreatureContext);
  const newRandomSeed = () => setRandomSeed(Date.now());
  const ctx: CreatureContextType = noFillIfShowingSpecs({
    ...defaultCtx,
    ...compCtx,
  });
  const [alwaysInclude, setAlwaysInclude] = useState<SvgSymbolData>(
    EMPTY_SVG_SYMBOL_DATA
  );
  const creature = useMemo(
    () =>
      repeatUntilSymbolIsIncluded(
        alwaysInclude,
        new Random(randomSeed),
        (rng) =>
          COMPLEXITY_LEVEL_GENERATORS[complexity]({
            rng,
            randomlyInvert,
          })
      ),
    [alwaysInclude, complexity, randomSeed, randomlyInvert]
  );

  return (
    <Page title="Creature!">
      <div className="sidebar">
        <CompositionContextWidget ctx={compCtx} onChange={setCompCtx} />
        <div className="thingy">
          <NumericSlider
            label="Random creature complexity"
            min={0}
            max={MAX_COMPLEXITY_LEVEL}
            step={1}
            value={complexity}
            onChange={(value) => {
              setComplexity(value);
              newRandomSeed();
            }}
          />
        </div>
        <div className="thingy">
          <Checkbox
            label="Randomly invert symbols"
            value={randomlyInvert}
            onChange={setRandomlyInvert}
          />
        </div>
        <RandomizerWidget
          onColorsChange={(colors) => setCompCtx({ ...compCtx, ...colors })}
          onSymbolsChange={newRandomSeed}
        >
          <div className="thingy">
            <VocabularyWidget
              label="Always include this symbol"
              value={alwaysInclude}
              onChange={setAlwaysInclude}
              choices={SvgVocabularyWithBlank}
            />
          </div>
        </RandomizerWidget>
        <div className="thingy">
          <ExportWidget
            basename={getDownloadBasename(randomSeed)}
            svgRef={svgRef}
          />
        </div>
      </div>
      <div className="canvas" style={{ backgroundColor: compCtx.background }}>
        <CreatureContext.Provider value={ctx}>
          <HoverDebugHelper>
            <AutoSizingSvg
              padding={20}
              ref={svgRef}
              bgColor={compCtx.background}
            >
              <SvgTransform transform={svgScale(0.5)}>
                <CreatureSymbol {...creature} />
              </SvgTransform>
            </AutoSizingSvg>
          </HoverDebugHelper>
        </CreatureContext.Provider>
      </div>
    </Page>
  );
};
