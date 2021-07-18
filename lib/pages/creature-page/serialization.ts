import * as avro from "avro-js";
import {
  Packer,
  SvgCompositionContextPacker,
} from "../mandala-page/serialization";
import { CreatureDesign } from "./core";
import { AvroCreatureDesign } from "./creature-design.avsc";
import { fromBase64, toBase64 } from "../../base64";
import CreatureAvsc from "./creature-design.avsc.json";
import { SvgVocabularyWithBlank } from "../../svg-vocabulary";

const LATEST_VERSION = "v1";

const avroCreatureDesign = avro.parse<AvroCreatureDesign>(CreatureAvsc);

const DesignConfigPacker: Packer<CreatureDesign, AvroCreatureDesign> = {
  pack: (value) => {
    return {
      ...value,
      alwaysIncludeSymbol: value.alwaysIncludeSymbol.name,
      compCtx: SvgCompositionContextPacker.pack(value.compCtx),
    };
  },
  unpack: (value) => {
    return {
      ...value,
      alwaysIncludeSymbol: SvgVocabularyWithBlank.get(
        value.alwaysIncludeSymbol
      ),
      compCtx: SvgCompositionContextPacker.unpack(value.compCtx),
    };
  },
};

export function serializeCreatureDesign(value: CreatureDesign): string {
  const buf = avroCreatureDesign.toBuffer(DesignConfigPacker.pack(value));
  return `${LATEST_VERSION}.${toBase64(buf)}`;
}

export function deserializeCreatureDesign(value: string): CreatureDesign {
  const [_version, serialized] = value.split(".", 2);
  const buf = fromBase64(serialized);
  return DesignConfigPacker.unpack(avroCreatureDesign.fromBuffer(buf));
}
