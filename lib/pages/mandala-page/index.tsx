import { SvgVocabulary } from "../../svg-vocabulary";
import { SvgCompositionContext } from "../../svg-composition-context";
import { createPageWithShareableState } from "../../page-with-shareable-state";
import MandalaAvsc from "./mandala-design.avsc.json";
import type {
  AvroCircle,
  AvroMandalaDesign,
  AvroSvgCompositionContext,
} from "./mandala-design.avsc";
import { SlowBuffer } from "buffer";
import * as avro from "avro-js";
import { clampedByteToHex } from "../../random-colors";
import {
  MANDALA_DESIGN_DEFAULTS,
  ExtendedMandalaCircleParams,
  MandalaDesign,
  MandalaPageWithDefaults,
} from "./core";

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
    return "#" + [red, green, blue].map(clampedByteToHex).join("");
  },
};

const DesignConfigPacker: Packer<MandalaDesign, AvroMandalaDesign> = {
  pack: (value) => {
    const circles: AvroCircle[] = [CirclePacker.pack(value.circle1)];
    if (value.useTwoCircles) {
      circles.push(CirclePacker.pack(value.circle2));
    }
    return {
      ...value,
      circles,
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

export function serializeMandalaDesign(value: MandalaDesign): string {
  const buf = avroMandalaDesign.toBuffer(DesignConfigPacker.pack(value));
  return btoa(String.fromCharCode(...buf));
}

export function deserializeMandalaDesign(value: string): MandalaDesign {
  const binaryString = atob(value);
  const view = new SlowBuffer(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    view[i] = binaryString.charCodeAt(i);
  }

  return DesignConfigPacker.unpack(avroMandalaDesign.fromBuffer(view));
}

export const MandalaPage = createPageWithShareableState({
  defaultValue: MANDALA_DESIGN_DEFAULTS,
  serialize: serializeMandalaDesign,
  deserialize: deserializeMandalaDesign,
  component: MandalaPageWithDefaults,
});
