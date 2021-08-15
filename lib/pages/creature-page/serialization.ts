import * as avro from "avro-js";
import { CreatureDesign } from "./core";
import { AvroCreatureDesign, AvroCreatureSymbol } from "./creature-design.avsc";
import { fromBase64, toBase64 } from "../../base64";
import CreatureAvsc from "./creature-design.avsc.json";
import { Packer, SvgCompositionContextPacker } from "../../serialization";
import { CreatureSymbol } from "../../creature-symbol";
import { SvgVocabulary } from "../../svg-vocabulary";

const LATEST_VERSION = "v2";

const avroCreatureDesign = avro.parse<AvroCreatureDesign>(CreatureAvsc);

const CreatureSymbolPacker: Packer<CreatureSymbol, AvroCreatureSymbol> = {
  pack: (value) => {
    return {
      ...value,
      symbol: value.data.name,

      // TODO: Implement this!
      attachments: [],
      nests: [],
    };
  },
  unpack: (value) => {
    return {
      ...value,
      data: SvgVocabulary.get(value.symbol),

      // TODO: Implement this!
      attachments: [],
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
