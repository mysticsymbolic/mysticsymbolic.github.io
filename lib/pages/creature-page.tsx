import React, { useContext, useRef, useState } from "react";
import { SvgVocabulary } from "../svg-vocabulary";
import { createSvgSymbolContext, SvgSymbolData } from "../svg-symbol";
import { iterAttachmentPoints } from "../specs";
import { Random } from "../random";
import { SymbolContextWidget } from "../symbol-context-widget";
import { range } from "../util";

import { AutoSizingSvg } from "../auto-sizing-svg";
import { exportSvg } from "../export-svg";
import {
  createCreatureSymbolFactory,
  extractCreatureSymbolFromElement,
} from "../creature-symbol-factory";
import {
  CreatureContext,
  CreatureContextType,
  CreatureSymbol,
  NestedCreatureSymbol,
} from "../creature-symbol";
import { HoverDebugHelper } from "../hover-debug-helper";

const DEFAULT_BG_COLOR = "#858585";

/**
 * Mapping from symbol names to symbol data, for quick and easy access.
 */
const SYMBOL_MAP = new Map(
  SvgVocabulary.map((symbol) => [symbol.name, symbol])
);

/** Symbols that can be the "root" (i.e., main body) of a creature. */
const ROOT_SYMBOLS = SvgVocabulary.filter(
  (data) => data.meta?.always_be_nested !== true
);

/** Symbols that can be attached to the main body of a creature. */
const ATTACHMENT_SYMBOLS = ROOT_SYMBOLS;

/** Symbols that can be nested within any part of a creature. */
const NESTED_SYMBOLS = SvgVocabulary.filter(
  // Since we don't currently support recursive nesting, ignore anything that
  // wants nested children.
  (data) =>
    data.meta?.always_nest !== true && data.meta?.never_be_nested !== true
);

/**
 * Returns the data for the given symbol, throwing an error
 * if it doesn't exist.
 */
function getSymbol(name: string): SvgSymbolData {
  const symbol = SYMBOL_MAP.get(name);
  if (!symbol) {
    throw new Error(`Unable to find the symbol "${name}"!`);
  }
  return symbol;
}

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
      const attachment = rng.choice(ATTACHMENT_SYMBOLS);
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

const symbol = createCreatureSymbolFactory(getSymbol);

const Eye = symbol("eye");

const Hand = symbol("hand");

const Arm = symbol("arm");

const Antler = symbol("antler");

const Crown = symbol("crown");

const Wing = symbol("wing");

const MuscleArm = symbol("muscle_arm");

const Leg = symbol("leg");

const Tail = symbol("tail");

const Lightning = symbol("lightning");

const EYE_CREATURE = (
  <Eye>
    <Lightning nestInside />
    <Arm attachTo="arm" left>
      <Wing attachTo="arm" left right />
    </Arm>
    <Arm attachTo="arm" right>
      <MuscleArm attachTo="arm" left right />
    </Arm>
    <Antler attachTo="horn" left right />
    <Crown attachTo="crown">
      <Hand attachTo="horn" left right>
        <Arm attachTo="arm" left />
      </Hand>
    </Crown>
    <Leg attachTo="leg" left right />
    <Tail attachTo="tail" invert />
  </Eye>
);

const EYE_CREATURE_SYMBOL = extractCreatureSymbolFromElement(EYE_CREATURE);

/**
 * Randomly replace all the parts of the given creature. Note that this
 * might end up logging some console messages about not being able to find
 * attachment/nesting indices, because it doesn't really check to make
 * sure the final creature structure is fully valid.
 */
function randomlyReplaceParts<T extends CreatureSymbol>(
  rng: Random,
  creature: T
): T {
  const result: T = {
    ...creature,
    data: rng.choice(SvgVocabulary),
    attachments: creature.attachments.map((a) => randomlyReplaceParts(rng, a)),
    nests: creature.nests.map((n) => randomlyReplaceParts(rng, n)),
  };
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
  ({ rng }) => randomlyReplaceParts(rng, EYE_CREATURE_SYMBOL),
];

const MAX_COMPLEXITY_LEVEL = COMPLEXITY_LEVEL_GENERATORS.length - 1;

function getDownloadFilename(randomSeed: number | null) {
  let downloadBasename = "mystic-symbolic-creature";

  if (randomSeed !== null) {
    downloadBasename += `-${randomSeed}`;
  }

  return `${downloadBasename}.svg`;
}

export const CreaturePage: React.FC<{}> = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR);
  const [randomSeed, setRandomSeed] = useState<number | null>(null);
  const [randomlyInvert, setRandomlyInvert] = useState(false);
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());
  const [complexity, setComplexity] = useState(MAX_COMPLEXITY_LEVEL);
  const defaultCtx = useContext(CreatureContext);
  const newRandomSeed = () => setRandomSeed(Date.now());
  const ctx: CreatureContextType = {
    ...defaultCtx,
    ...symbolCtx,
    fill: symbolCtx.showSpecs ? "none" : symbolCtx.fill,
  };
  const creature =
    randomSeed === null
      ? EYE_CREATURE_SYMBOL
      : COMPLEXITY_LEVEL_GENERATORS[complexity]({
          rng: new Random(randomSeed),
          randomlyInvert,
        });
  const handleSvgExport = () =>
    exportSvg(getDownloadFilename(randomSeed), svgRef);
  const isBonkers = complexity === MAX_COMPLEXITY_LEVEL;

  return (
    <>
      <h1>Creature!</h1>
      <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx}>
        <label htmlFor="bgColor">Background: </label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
        />{" "}
      </SymbolContextWidget>
      <p>
        <label htmlFor="complexity">Random creature complexity: </label>
        <input
          type="range"
          min={0}
          max={MAX_COMPLEXITY_LEVEL}
          step={1}
          value={complexity}
          onChange={(e) => {
            setComplexity(parseInt(e.target.value));
            newRandomSeed();
          }}
        />{" "}
        {isBonkers ? "bonkers" : complexity}
      </p>
      {!isBonkers && (
        <p>
          <label>
            <input
              type="checkbox"
              checked={randomlyInvert}
              onChange={(e) => setRandomlyInvert(e.target.checked)}
            />
            Randomly invert symbols
          </label>
        </p>
      )}
      <p>
        <button accessKey="r" onClick={newRandomSeed}>
          <u>R</u>andomize!
        </button>{" "}
        <button onClick={() => window.location.reload()}>Reset</button>{" "}
        <button onClick={handleSvgExport}>Export SVG</button>
      </p>
      <CreatureContext.Provider value={ctx}>
        <HoverDebugHelper>
          <AutoSizingSvg padding={20} ref={svgRef} bgColor={bgColor}>
            <g transform="scale(0.5 0.5)">
              <CreatureSymbol {...creature} />
            </g>
          </AutoSizingSvg>
        </HoverDebugHelper>
      </CreatureContext.Provider>
    </>
  );
};
