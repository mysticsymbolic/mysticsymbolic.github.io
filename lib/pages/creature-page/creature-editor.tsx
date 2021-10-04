import React, { CSSProperties } from "react";
import { Checkbox } from "../../checkbox";
import {
  AttachedCreatureSymbol,
  CreatureSymbol,
  NestedCreatureSymbol,
} from "../../creature-symbol";
import { RememberedDetails } from "../../remembered-details";
import { AttachmentPointType, ATTACHMENT_POINT_TYPES } from "../../specs";
import { SvgVocabulary } from "../../svg-vocabulary";
import { capitalize, range } from "../../util";
import { VocabularyWidget } from "../../vocabulary-widget";

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

class ArrayManipulator<T> {
  constructor(readonly items: T[]) {}

  strictIndexOf(item: T): number {
    const index = this.items.indexOf(item);
    if (index === -1) {
      throw new Error(`Assertion failure, unable to find item`);
    }
    return index;
  }

  withItemRemoved(item: T): T[] {
    const items = this.items.slice();
    items.splice(this.strictIndexOf(item), 1);
    return items;
  }

  withItemUpdated(originalItem: T, updatedItem: T): T[] {
    const items = this.items.slice();
    items[this.strictIndexOf(originalItem)] = updatedItem;
    return items;
  }

  withItemAdded(item: T): T[] {
    return [...this.items, item];
  }
}

function NestingEditor<T extends CreatureSymbol>({
  creature,
  onChange,
  idPrefix,
}: CreatureEditorProps<T>): JSX.Element | null {
  const specs = creature.data.specs || {};
  const nests = new ArrayManipulator(creature.nests);
  const handleChangedNests = (nests: NestedCreatureSymbol[]) =>
    onChange({
      ...creature,
      nests,
    });
  const deleteNested = (nested: NestedCreatureSymbol) =>
    handleChangedNests(nests.withItemRemoved(nested));
  const updateNested = (
    orig: NestedCreatureSymbol,
    updated: NestedCreatureSymbol
  ) => handleChangedNests(nests.withItemUpdated(orig, updated));
  const addNested = (indices: number[]) =>
    handleChangedNests(
      nests.withItemAdded({
        indices,
        data: SvgVocabulary.items[0],
        invertColors: false,
        attachments: [],
        nests: [],
      })
    );

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
  const attachments = new ArrayManipulator(creature.attachments);
  const handleChangedAttachments = (attachments: AttachedCreatureSymbol[]) =>
    onChange({ ...creature, attachments });
  const deleteAttachment = (attachment: AttachedCreatureSymbol) =>
    handleChangedAttachments(attachments.withItemRemoved(attachment));
  const updateAttachment = (
    originalAttachment: AttachedCreatureSymbol,
    updatedAttachment: AttachedCreatureSymbol
  ) =>
    handleChangedAttachments(
      attachments.withItemUpdated(originalAttachment, updatedAttachment)
    );
  const addAttachment = (attachTo: AttachmentPointType, indices: number[]) =>
    handleChangedAttachments(
      attachments.withItemAdded({
        attachTo,
        indices,
        data: SvgVocabulary.items[0],
        invertColors: false,
        attachments: [],
        nests: [],
      })
    );

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

export const CreatureEditorWidget: React.FC<{
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
