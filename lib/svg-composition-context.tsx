import React from "react";
import { mixColor } from "./color-util";
import { ColorWidget } from "./color-widget";
import { DEFAULT_BG_COLOR } from "./colors";
import { createSvgSymbolContext, SvgSymbolContext } from "./svg-symbol";
import {
  SymbolContextWidget,
  SymbolContextWidgetProps,
} from "./symbol-context-widget";

const DEFAULT_CONTEXT: SvgCompositionContext = {
  background: DEFAULT_BG_COLOR,
  ...createSvgSymbolContext(),
};

export type SvgCompositionContext = SvgSymbolContext & {
  /** The background color of the composition, as a hex hash (e.g. '#ff0000'). */
  background: string;
};

export function createSvgCompositionContext(
  ctx: Partial<SvgCompositionContext> = {}
): SvgCompositionContext {
  return {
    ...DEFAULT_CONTEXT,
    ...ctx,
  };
}

export type CompositionContextWidgetProps<T extends SvgCompositionContext> =
  SymbolContextWidgetProps<T>;

export function CompositionContextWidget<T extends SvgCompositionContext>({
  ctx,
  onChange,
  children,
}: CompositionContextWidgetProps<T>): JSX.Element {
  const resetColors = () => {
    const { background, stroke, fill } = DEFAULT_CONTEXT;
    onChange({ ...ctx, background, stroke, fill });
  };
  const monochromatizeColors = () => {
    onChange({
      ...ctx,
      stroke: mixColor(ctx.background, DEFAULT_CONTEXT.stroke, 0.1),
      fill: mixColor(ctx.background, DEFAULT_CONTEXT.fill, 0.1),
    });
  };
  const extraButtons = (
    <>
      <button
        onClick={resetColors}
        title="Reset colors to their black &amp; white defaults"
      >
        B&amp;W
      </button>{" "}
      <button
        onClick={monochromatizeColors}
        title="Make stroke and fill a variation of the background"
      >
        Mono
      </button>{" "}
    </>
  );
  return (
    <SymbolContextWidget
      ctx={ctx}
      onChange={onChange}
      extraButtons={extraButtons}
    >
      {children}
      <ColorWidget
        label="Background"
        value={ctx.background}
        onChange={(background) => onChange({ ...ctx, background })}
      />{" "}
    </SymbolContextWidget>
  );
}
