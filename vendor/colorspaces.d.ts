declare module "colorspaces" {
  export type Color = {
    is_displayable(): boolean;
    as(format: "hex"): string;
  };

  export function make_color(kind: "CIELUV" | "sRGB", value: number[]): Color;
}
