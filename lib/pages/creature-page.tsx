import React, { useContext, useRef, useState } from "react";
import { SvgVocabulary } from "../svg-vocabulary";
import { noFillIfShowingSpecs, SvgSymbolData } from "../svg-symbol";
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

/** Symbols that can be the "root" (i.e., main body) of a creature. */
const ROOT_SYMBOLS = SvgVocabulary.items.filter(
  (data) => data.meta?.always_be_nested !== true
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
    result[type] = SvgVocabulary.items.filter((data) => {
      const { meta } = data;

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
const NESTED_SYMBOLS = SvgVocabulary.items.filter(
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
  const creature = COMPLEXITY_LEVEL_GENERATORS[complexity]({
    rng: new Random(randomSeed),
    randomlyInvert,
  });

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
        <div className="thingy">
          <button accessKey="r" onClick={newRandomSeed}>
            <u>R</u>andomize!
          </button>{" "}
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
