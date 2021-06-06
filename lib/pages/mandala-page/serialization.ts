import { SvgVocabulary } from "../../svg-vocabulary";
import { SvgCompositionContext } from "../../svg-composition-context";
import MandalaAvsc from "./mandala-design.avsc.json";
import MandalaAvscV1 from "./mandala-design.v1.avsc.json";
import type {
  AvroCircle,
  AvroMandalaDesign,
  AvroSvgCompositionContext,
} from "./mandala-design.avsc";
import * as avro from "avro-js";
import {
  MANDALA_DESIGN_DEFAULTS,
  ExtendedMandalaCircleParams,
  MandalaDesign,
  getCirclesFromDesign,
} from "./core";
import { fromBase64, toBase64 } from "../../base64";
import { clampedBytesToRGBColor } from "../../color-util";

const LATEST_VERSION = "v2";

const avroMandalaDesign = avro.parse<AvroMandalaDesign>(MandalaAvsc);

/**
 * A generic interface for "packing" one type to a different representation
 * for the purposes of serialization, and "unpacking" the packed type
 * back to its original representation (for deserialization).
 */
interface Packer<UnpackedType, PackedType> {
  pack(value: UnpackedType): PackedType;
  unpack(value: PackedType): UnpackedType;
}

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

const SvgCompositionContextPacker: Packer<
  SvgCompositionContext,
  AvroSvgCompositionContext
> = {
  pack: (ctx) => ({
    ...ctx,
    fill: ColorPacker.pack(ctx.fill),
    stroke: ColorPacker.pack(ctx.stroke),
    background: ColorPacker.pack(ctx.background),
    uniformStrokeWidth: ctx.uniformStrokeWidth || 1,
  }),
  unpack: (ctx) => ({
    ...ctx,
    fill: ColorPacker.unpack(ctx.fill),
    stroke: ColorPacker.unpack(ctx.stroke),
    background: ColorPacker.unpack(ctx.background),
    showSpecs: false,
  }),
};

export const ColorPacker: Packer<string, number> = {
  pack: (string) => {
    const red = parseInt(string.substring(1, 3), 16);
    const green = parseInt(string.substring(3, 5), 16);
    const blue = parseInt(string.substring(5, 7), 16);
    return (red << 16) + (green << 8) + blue;
  },
  unpack: (number) => {
    const red = (number >> 16) & 0xff;
    const green = (number >> 8) & 0xff;
    const blue = number & 0xff;
    return clampedBytesToRGBColor([red, green, blue]);
  },
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

function migrate(version: string, value: string): string {
  if (version === "v1") {
    const design = avroMandalaDesign.fromBuffer(
      fromBase64(value),
      avroMandalaDesign.createResolver(avro.parse(MandalaAvscV1)),
      true
    );
    return toBase64(avroMandalaDesign.toBuffer(design));
  } else {
    throw new Error(`Don't know how to migrate from ${version}`);
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
  if (version !== LATEST_VERSION) {
    value = migrate(version, value);
  }
  const buf = fromBase64(value);
  return DesignConfigPacker.unpack(avroMandalaDesign.fromBuffer(buf));
}
