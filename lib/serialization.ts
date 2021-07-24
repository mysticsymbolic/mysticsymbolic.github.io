import { clampedBytesToRGBColor, parseHexColor } from "./color-util";
import { AvroSvgCompositionContext } from "./pages/mandala-page/mandala-design.avsc";
import { SvgCompositionContext } from "./svg-composition-context";

/**
 * A generic interface for "packing" one type to a different representation
 * for the purposes of serialization, and "unpacking" the packed type
 * back to its original representation (for deserialization).
 */
export interface Packer<UnpackedType, PackedType> {
  pack(value: UnpackedType): PackedType;
  unpack(value: PackedType): UnpackedType;
}

export const ColorPacker: Packer<string, number> = {
  pack: (string) => {
    const [red, green, blue] = parseHexColor(string);
    return (red << 16) + (green << 8) + blue;
  },
  unpack: (number) => {
    const red = (number >> 16) & 0xff;
    const green = (number >> 8) & 0xff;
    const blue = number & 0xff;
    return clampedBytesToRGBColor([red, green, blue]);
  },
};

export const SvgCompositionContextPacker: Packer<
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
