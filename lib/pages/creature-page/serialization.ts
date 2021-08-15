import * as avro from "avro-js";
import { CreatureDesign } from "./core";
import {
  AvroAttachedCreatureSymbol,
  AvroCreatureDesign,
  AvroCreatureSymbol,
} from "./creature-design.avsc";
import { fromBase64, toBase64 } from "../../base64";
import CreatureAvsc from "./creature-design.avsc.json";
import { Packer, SvgCompositionContextPacker } from "../../serialization";
import { AttachedCreatureSymbol, CreatureSymbol } from "../../creature-symbol";
import { SvgVocabulary } from "../../svg-vocabulary";
import { ATTACHMENT_POINT_TYPES } from "../../specs";

const LATEST_VERSION = "v2";

const avroCreatureDesign = avro.parse<AvroCreatureDesign>(CreatureAvsc);

const ATTACHMENT_POINT_MAPPING = new Map(
  ATTACHMENT_POINT_TYPES.map((name, i) => {
    return [name, i];
  })
);

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
      ...value,
      symbol: value.data.name,
      attachments: value.attachments.map(AttachedCreatureSymbolPacker.pack),
      nests: [],
    };
  },
  unpack: (value) => {
    return {
      ...value,
      data: SvgVocabulary.get(value.symbol),
      attachments: value.attachments.map(AttachedCreatureSymbolPacker.unpack),
      nests: [],
    };
  },
};

const DesignConfigPacker: Packer<CreatureDesign, AvroCreatureDesign> = {
  pack: (value) => {
    return {
      creature: CreatureSymbolPacker.pack(value.creature),
      compCtx: SvgCompositionContextPacker.pack(value.compCtx),
    };
  },
  unpack: (value) => {
    return {
      creature: CreatureSymbolPacker.unpack(value.creature),
      compCtx: SvgCompositionContextPacker.unpack(value.compCtx),
    };
  },
};

export function serializeCreatureDesign(value: CreatureDesign): string {
  const buf = avroCreatureDesign.toBuffer(DesignConfigPacker.pack(value));
  return `${LATEST_VERSION}.${toBase64(buf)}`;
}

export function deserializeCreatureDesign(value: string): CreatureDesign {
  const [version, serialized] = value.split(".", 2);
  if (version === "v1") {
    throw new Error(`Sorry, we no longer support loading v1 creatures!`);
  }
  const buf = fromBase64(serialized);
  return DesignConfigPacker.unpack(avroCreatureDesign.fromBuffer(buf));
}
