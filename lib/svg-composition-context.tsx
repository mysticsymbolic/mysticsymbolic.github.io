import React from "react";
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
  return (
    <SymbolContextWidget ctx={ctx} onChange={onChange}>
      {children}
      <ColorWidget
        label="Background"
        value={ctx.background}
        onChange={(background) => onChange({ ...ctx, background })}
      />{" "}
    </SymbolContextWidget>
  );
}
