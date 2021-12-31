import * as avro from "avro-js";
import { CreatureDesign } from "./core";
import {
  AvroAttachedCreatureSymbol,
  AvroCreatureDesign,
  AvroCreatureSymbol,
  AvroNestedCreatureSymbol,
} from "./creature-design.avsc";
import { fromBase64, toBase64 } from "../../base64";
import CreatureAvsc from "./creature-design.avsc.json";
import CreatureAvscV2 from "./creature-design.v2.avsc.json";
import { Packer, SvgCompositionContextPacker } from "../../serialization";
import {
  AttachedCreatureSymbol,
  CreatureSymbol,
  NestedCreatureSymbol,
} from "../../creature-symbol";
import { SvgVocabulary } from "../../svg-vocabulary";
import { ATTACHMENT_POINT_TYPES } from "../../specs";
import {
  creatureAnimatorIdToName,
  creatureAnimatorNameToId,
} from "../../creature-animator";

const LATEST_VERSION = "v3";

const avroCreatureDesign = avro.parse<AvroCreatureDesign>(CreatureAvsc);

const ATTACHMENT_POINT_MAPPING = new Map(
  ATTACHMENT_POINT_TYPES.map((name, i) => {
    return [name, i];
  })
);

const NestedCreatureSymbolPacker: Packer<
  NestedCreatureSymbol,
  AvroNestedCreatureSymbol
> = {
  pack: (value) => {
    return {
      base: CreatureSymbolPacker.pack(value),
      indices: Buffer.from(value.indices),
    };
  },
  unpack: (value) => {
    return {
      ...CreatureSymbolPacker.unpack(value.base),
      indices: Array.from(value.indices),
    };
  },
};

const AttachedCreatureSymbolPacker: Packer<
  AttachedCreatureSymbol,
  AvroAttachedCreatureSymbol
> = {
  pack: (value) => {
    const attachTo = ATTACHMENT_POINT_MAPPING.get(value.attachTo);
    if (attachTo === undefined) {
      throw new Error(`Invalid attachment type "${value.attachTo}"`);
    }
    return {
      base: CreatureSymbolPacker.pack(value),
      attachTo,
      indices: Buffer.from(value.indices),
    };
  },
  unpack: (value) => {
    const attachTo = ATTACHMENT_POINT_TYPES[value.attachTo];
    if (attachTo === undefined) {
      throw new Error(`Invalid attachment type "${value.attachTo}"`);
    }
    return {
      ...CreatureSymbolPacker.unpack(value.base),
      attachTo,
      indices: Array.from(value.indices),
    };
  },
};

const CreatureSymbolPacker: Packer<CreatureSymbol, AvroCreatureSymbol> = {
  pack: (value) => {
    return {
      invertColors: value.invertColors,
      symbol: value.data.name,
      attachments: value.attachments.map(AttachedCreatureSymbolPacker.pack),
      nests: value.nests.map(NestedCreatureSymbolPacker.pack),
    };
  },
  unpack: (value) => {
    return {
      invertColors: value.invertColors,
      data: SvgVocabulary.get(value.symbol),
      attachments: value.attachments.map(AttachedCreatureSymbolPacker.unpack),
      nests: value.nests.map(NestedCreatureSymbolPacker.unpack),
    };
  },
};

const DesignConfigPacker: Packer<CreatureDesign, AvroCreatureDesign> = {
  pack: (value) => {
    return {
      animatorId: creatureAnimatorNameToId(value.animatorName),
      creature: CreatureSymbolPacker.pack(value.creature),
      compCtx: SvgCompositionContextPacker.pack(value.compCtx),
    };
  },
  unpack: (value) => {
    return {
      animatorName: creatureAnimatorIdToName(value.animatorId) ?? "none",
      creature: CreatureSymbolPacker.unpack(value.creature),
      compCtx: SvgCompositionContextPacker.unpack(value.compCtx),
    };
  },
};

function loadSchemaVersion(version: string, buf: Buffer): AvroCreatureDesign {
  switch (version) {
    case "v1":
      throw new Error(`Sorry, we no longer support loading v1 creatures!`);

    case "v2":
      const res = avroCreatureDesign.createResolver(avro.parse(CreatureAvscV2));
      return avroCreatureDesign.fromBuffer(buf, res);

    case LATEST_VERSION:
      return avroCreatureDesign.fromBuffer(buf);

    default:
      throw new Error(`Don't know how to load schema version ${version}`);
  }
}

export function serializeCreatureDesign(value: CreatureDesign): string {
  const buf = avroCreatureDesign.toBuffer(DesignConfigPacker.pack(value));
  return `${LATEST_VERSION}.${toBase64(buf)}`;
}

export function deserializeCreatureDesign(value: string): CreatureDesign {
  const [version, serialized] = value.split(".", 2);
  const buf = fromBase64(serialized);
  return DesignConfigPacker.unpack(loadSchemaVersion(version, buf));
}
