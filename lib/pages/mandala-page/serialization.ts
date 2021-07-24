import { SvgVocabulary } from "../../svg-vocabulary";
import MandalaAvsc from "./mandala-design.avsc.json";
import MandalaAvscV1 from "./mandala-design.v1.avsc.json";
import type { AvroCircle, AvroMandalaDesign } from "./mandala-design.avsc";
import * as avro from "avro-js";
import {
  MANDALA_DESIGN_DEFAULTS,
  ExtendedMandalaCircleParams,
  MandalaDesign,
  getCirclesFromDesign,
} from "./core";
import { fromBase64, toBase64 } from "../../base64";
import { Packer, SvgCompositionContextPacker } from "../../serialization";

const LATEST_VERSION = "v2";

const avroMandalaDesign = avro.parse<AvroMandalaDesign>(MandalaAvsc);

const CirclePacker: Packer<ExtendedMandalaCircleParams, AvroCircle> = {
  pack: ({ data, ...circle }) => ({
    ...circle,
    symbol: data.name,
  }),
  unpack: ({ symbol, ...circle }) => ({
    ...circle,
    data: SvgVocabulary.get(symbol),
  }),
};

const DesignConfigPacker: Packer<MandalaDesign, AvroMandalaDesign> = {
  pack: (value) => {
    return {
      ...value,
      circles: getCirclesFromDesign(value).map(CirclePacker.pack),
      baseCompCtx: SvgCompositionContextPacker.pack(value.baseCompCtx),
    };
  },
  unpack: ({ circles, ...value }) => {
    if (circles.length === 0) {
      throw new Error(`Circles must have at least one item!`);
    }
    const useTwoCircles = circles.length > 1;
    const circle1 = CirclePacker.unpack(circles[0]);
    const circle2 = useTwoCircles
      ? CirclePacker.unpack(circles[1])
      : MANDALA_DESIGN_DEFAULTS.circle2;
    return {
      ...value,
      baseCompCtx: SvgCompositionContextPacker.unpack(value.baseCompCtx),
      circle1,
      circle2,
      useTwoCircles,
    };
  },
};

function loadSchemaVersion(version: string, buf: Buffer): AvroMandalaDesign {
  switch (version) {
    case "v1":
      const res = avroMandalaDesign.createResolver(avro.parse(MandalaAvscV1));
      return avroMandalaDesign.fromBuffer(buf, res);

    case LATEST_VERSION:
      return avroMandalaDesign.fromBuffer(buf);

    default:
      throw new Error(`Don't know how to load schema version ${version}`);
  }
}

export function serializeMandalaDesign(value: MandalaDesign): string {
  const buf = avroMandalaDesign.toBuffer(DesignConfigPacker.pack(value));
  return `${LATEST_VERSION}.${toBase64(buf)}`;
}

export function deserializeMandalaDesign(value: string): MandalaDesign {
  let version = "v1";
  if (value.indexOf(".") !== -1) {
    [version, value] = value.split(".", 2);
  }
  const buf = fromBase64(value);
  return DesignConfigPacker.unpack(loadSchemaVersion(version, buf));
}
