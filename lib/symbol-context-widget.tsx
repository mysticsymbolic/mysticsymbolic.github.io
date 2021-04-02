import React from "react";
import { Checkbox } from "./checkbox";
import { ColorWidget } from "./color-widget";
import { NumericSlider } from "./numeric-slider";
import { SvgSymbolContext, swapColors } from "./svg-symbol";

export type SymbolContextWidgetProps<T extends SvgSymbolContext> = {
  ctx: T;
  onChange: (value: T) => void;
  children?: any;
  extraButtons?: JSX.Element;
};

export function SymbolContextWidget<T extends SvgSymbolContext>({
  ctx,
  children,
  onChange,
  extraButtons,
}: SymbolContextWidgetProps<T>): JSX.Element {
  const updateCtx = (updates: Partial<SvgSymbolContext>) => {
    onChange({ ...ctx, ...updates });
  };

  return (
    <div className="thingy">
      {children}
      <ColorWidget
        label="Stroke"
        value={ctx.stroke}
        onChange={(stroke) => updateCtx({ stroke })}
      />{" "}
      <ColorWidget
        label="Fill"
        value={ctx.fill}
        onChange={(fill) => updateCtx({ fill })}
      />{" "}
      <button onClick={() => updateCtx(swapColors(ctx))}>
        Swap stroke/fill
      </button>{" "}
      {extraButtons}
      <Checkbox
        label="Show specs"
        value={ctx.showSpecs}
        onChange={(showSpecs) => updateCtx({ showSpecs })}
      />
      {ctx.uniformStrokeWidth !== undefined && (
        <div className="thingy">
          <NumericSlider
            label="Stroke width"
            min={0}
            max={3}
            step={0.1}
            value={ctx.uniformStrokeWidth}
            onChange={(uniformStrokeWidth) => updateCtx({ uniformStrokeWidth })}
          />
        </div>
      )}
    </div>
  );
}
