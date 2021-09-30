import React, {
  CSSProperties,
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
import { capitalize, range } from "../../util";

import { AutoSizingSvg } from "../../auto-sizing-svg";
import { ExportWidget } from "../../export-svg";
import {
  AttachedCreatureSymbol,
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
  compCtx: SvgCompositionContext;
  creature: CreatureSymbol;
};

export const CREATURE_DESIGN_DEFAULTS: CreatureDesign = {
  compCtx: createSvgCompositionContext(),
  creature: {
    data: ROOT_SYMBOLS[0],
    invertColors: false,
    attachments: [],
    nests: [],
  },
};

type SymbolWithIndices = CreatureSymbol & { indices: number[] };

function getAvailableIndices(
  symbols: SymbolWithIndices[],
  numIndices: number
): number[] {
  const available = new Set(range(numIndices));

  for (let s of symbols) {
    for (let i of s.indices) {
      available.delete(i);
    }
  }

  return Array.from(available);
}

function getImmutableIndices(
  symbols: SymbolWithIndices[],
  symbol: SymbolWithIndices
): Set<number> {
  const immutableIndices = new Set<number>();

  for (let s of symbols) {
    if (s !== symbol) {
      for (let idx of s.indices) {
        // This index is taken up by another attachment.
        immutableIndices.add(idx);
      }
    }
  }

  if (symbol.indices.length === 1) {
    // This attachment is only for one index, don't let it be unselected.
    immutableIndices.add(symbol.indices[0]);
  }

  return immutableIndices;
}

type IndicesWidgetProps<T extends SymbolWithIndices> = {
  label: string;
  numIndices: number;
  immutableIndices: Set<number>;
  symbol: T;
  onChange: (symbol: T) => void;
};

function IndicesWidget<T extends SymbolWithIndices>({
  symbol,
  onChange,
  label,
  numIndices,
  immutableIndices,
}: IndicesWidgetProps<T>): JSX.Element {
  const allIndices = range(numIndices);
  const toggleIndex = (i: number) => {
    const indices = symbol.indices.slice();
    const idx = indices.indexOf(i);
    if (idx === -1) {
      indices.push(i);
    } else {
      indices.splice(idx, 1);
    }
    onChange({ ...symbol, indices });
  };

  return (
    <>
      <div>{label}</div>
      <div>
        {allIndices.map((i) => {
          return (
            <Checkbox
              key={i}
              label={i.toString()}
              onChange={() => toggleIndex(i)}
              disabled={immutableIndices.has(i)}
              value={symbol.indices.includes(i)}
            />
          );
        })}
      </div>
    </>
  );
}

function NestingEditor<T extends CreatureSymbol>({
  creature,
  onChange,
  idPrefix,
}: CreatureEditorProps<T>): JSX.Element | null {
  const specs = creature.data.specs || {};
  const getNestedIndex = (nested: NestedCreatureSymbol) => {
    const index = creature.nests.indexOf(nested);
    if (index === -1) {
      throw new Error(
        `Assertion failure, unable to find nested symbol in creature`
      );
    }
    return index;
  };
  const deleteNested = (nested: NestedCreatureSymbol) => {
    const nests = creature.nests.slice();
    nests.splice(getNestedIndex(nested), 1);
    onChange({
      ...creature,
      nests,
    });
  };
  const updateNested = (
    originalNested: NestedCreatureSymbol,
    updatedNested: NestedCreatureSymbol
  ) => {
    const nests = creature.nests.slice();
    nests[getNestedIndex(originalNested)] = updatedNested;
    onChange({
      ...creature,
      nests,
    });
  };
  const addNested = (indices: number[]) => {
    const nested: NestedCreatureSymbol = {
      indices,
      data: SvgVocabulary.items[0],
      invertColors: false,
      attachments: [],
      nests: [],
    };
    onChange({
      ...creature,
      nests: [...creature.nests, nested],
    });
  };

  const points = specs.nesting || [];
  const symbolHasNesting = points.length > 0;
  const creatureDefinesNesting = creature.nests.length > 0;
  if (!symbolHasNesting && !creatureDefinesNesting) {
    return null;
  }
  const style: CSSProperties = {};
  let title = `Symbol defines nesting and cluster provides at least one`;
  if (!symbolHasNesting) {
    style.textDecoration = "line-through";
    title = `Cluster defines nesting but symbol doesn't define any`;
    // Honestly, this is just going to confuse people, so leave it out
    // for now.
    return null;
  }
  if (!creatureDefinesNesting) {
    style.color = "gray";
    title = `Symbol defines nesting but cluster doesn't provide any`;
  }
  const availableIndices = getAvailableIndices(creature.nests, points.length);
  return (
    <div>
      <div style={style} title={title}>
        Nesting
      </div>
      {creature.nests.map((nest, i) => {
        const atIdPrefix = `${idPrefix}_nest_${i}_`;
        const immutableIndices = getImmutableIndices(creature.nests, nest);

        return (
          <div
            key={i}
            style={{
              borderLeft: "2px solid lightgray",
              paddingLeft: "4px",
            }}
          >
            <IndicesWidget
              label={`nesting indices:`}
              numIndices={points.length}
              immutableIndices={immutableIndices}
              symbol={nest}
              onChange={updateNested.bind(null, nest)}
            />
            <div className="thingy">
              <button onClick={deleteNested.bind(null, nest)}>
                Remove this nested symbol
              </button>
            </div>
            <CreaturePartEditor
              creature={nest}
              onChange={updateNested.bind(null, nest)}
              idPrefix={atIdPrefix}
            />
          </div>
        );
      })}
      {availableIndices.length > 0 && (
        <button onClick={() => addNested(availableIndices)}>
          Add nested symbol
        </button>
      )}
    </div>
  );
}

function AttachmentEditor<T extends CreatureSymbol>({
  creature,
  onChange,
  idPrefix,
}: CreatureEditorProps<T>): JSX.Element {
  const specs = creature.data.specs || {};
  const getAttachmentIndex = (attachment: AttachedCreatureSymbol) => {
    const index = creature.attachments.indexOf(attachment);
    if (index === -1) {
      throw new Error(
        `Assertion failure, unable to find attachment in creature`
      );
    }
    return index;
  };
  const deleteAttachment = (attachment: AttachedCreatureSymbol) => {
    const attachments = creature.attachments.slice();
    attachments.splice(getAttachmentIndex(attachment), 1);
    onChange({
      ...creature,
      attachments,
    });
  };
  const updateAttachment = (
    originalAttachment: AttachedCreatureSymbol,
    updatedAttachment: AttachedCreatureSymbol
  ) => {
    const attachments = creature.attachments.slice();
    attachments[getAttachmentIndex(originalAttachment)] = updatedAttachment;
    onChange({
      ...creature,
      attachments,
    });
  };
  const addAttachment = (attachTo: AttachmentPointType, indices: number[]) => {
    const attachment: AttachedCreatureSymbol = {
      attachTo,
      indices,
      data: SvgVocabulary.items[0],
      invertColors: false,
      attachments: [],
      nests: [],
    };
    onChange({
      ...creature,
      attachments: [...creature.attachments, attachment],
    });
  };

  return (
    <>
      {" "}
      {ATTACHMENT_POINT_TYPES.map((type) => {
        if (type === "anchor") return null;
        const points = specs[type] || [];
        const symbolHasAttachments = points.length > 0;
        const creatureAttachments = creature.attachments.filter(
          (at) => at.attachTo === type
        );
        const creatureDefinesAttachments = creatureAttachments.length > 0;
        if (!symbolHasAttachments && !creatureDefinesAttachments) {
          return null;
        }
        const style: CSSProperties = {};
        let title = `Symbol defines ${type}(s) and cluster provides at least one`;
        if (!symbolHasAttachments) {
          style.textDecoration = "line-through";
          title = `Cluster defines ${type}(s) but symbol doesn't define any`;
          // Honestly, this is just going to confuse people, so leave it out
          // for now.
          return;
        }
        if (!creatureDefinesAttachments) {
          style.color = "gray";
          title = `Symbol defines ${type}(s) but cluster doesn't provide any`;
        }
        const availableIndices = getAvailableIndices(
          creatureAttachments,
          points.length
        );
        const typeCap = capitalize(type);
        return (
          <div key={type}>
            <div style={style} title={title}>
              {typeCap} attachments
            </div>
            {creatureAttachments.map((attach, i) => {
              const atIdPrefix = `${idPrefix}_${type}_${i}_`;
              const immutableIndices = getImmutableIndices(
                creatureAttachments,
                attach
              );

              return (
                <div
                  key={i}
                  style={{
                    borderLeft: "2px solid lightgray",
                    paddingLeft: "4px",
                  }}
                >
                  <IndicesWidget
                    label={`${typeCap} attachment point indices:`}
                    numIndices={points.length}
                    immutableIndices={immutableIndices}
                    symbol={attach}
                    onChange={updateAttachment.bind(null, attach)}
                  />
                  <div className="thingy">
                    <button onClick={deleteAttachment.bind(null, attach)}>
                      Remove this attachment
                    </button>
                  </div>
                  <CreaturePartEditor
                    creature={attach}
                    onChange={updateAttachment.bind(null, attach)}
                    idPrefix={atIdPrefix}
                  />
                </div>
              );
            })}
            {availableIndices.length > 0 && (
              <button onClick={() => addAttachment(type, availableIndices)}>
                Add {type} attachment
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}

type CreatureEditorProps<T extends CreatureSymbol> = {
  creature: T;
  onChange: (symbol: T) => void;
  idPrefix: string;
};

function CreaturePartEditor<T extends CreatureSymbol>({
  creature,
  onChange,
  idPrefix,
}: CreatureEditorProps<T>): JSX.Element {
  return (
    <>
      <div className="thingy">
        <VocabularyWidget
          label="Symbol"
          id={`${idPrefix}symbol`}
          value={creature.data}
          onChange={(data) => onChange({ ...creature, data })}
          choices={SvgVocabulary}
        />
      </div>
      <Checkbox
        label="Invert colors"
        value={creature.invertColors}
        onChange={(invertColors) => onChange({ ...creature, invertColors })}
      />
      <AttachmentEditor
        creature={creature}
        onChange={onChange}
        idPrefix={idPrefix}
      />
      <NestingEditor
        creature={creature}
        onChange={onChange}
        idPrefix={idPrefix}
      />
    </>
  );
}

const RememberedDetails: React.FC<{ id: string }> = ({ id, children }) => {
  const [isOpen, setIsOpen] = useRememberedState(id, false);

  return (
    <details
      onToggle={(e) => setIsOpen((e.currentTarget as HTMLDetailsElement).open)}
      open={isOpen}
    >
      {children}
    </details>
  );
};

const CreatureEditorWidget: React.FC<{
  creature: CreatureSymbol;
  onChange: (symbol: CreatureSymbol) => void;
}> = ({ creature, onChange }) => {
  return (
    <div className="thingy">
      <RememberedDetails id="creature_editor_widget">
        <summary>Edit cluster&hellip;</summary>
        <CreaturePartEditor
          creature={creature}
          onChange={onChange}
          idPrefix="creature_edit_"
        />
      </RememberedDetails>
    </div>
  );
};

export const CreaturePageWithDefaults: React.FC<
  ComponentWithShareableStateProps<CreatureDesign>
> = ({ defaults, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
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
      creature,
      compCtx,
    }),
    [creature, compCtx]
  );

  useDebouncedEffect(
    250,
    useCallback(() => onChange(design), [onChange, design])
  );

  return (
    <Page title="Cluster!">
      <div className="sidebar">
        <CompositionContextWidget ctx={compCtx} onChange={setCompCtx} />
        <CreatureEditorWidget creature={creature} onChange={setCreature} />
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
