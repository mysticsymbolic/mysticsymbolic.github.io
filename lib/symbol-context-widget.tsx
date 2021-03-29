import React from "react";
import { Checkbox } from "./checkbox";
import { ColorWidget } from "./color-widget";
import { NumericSlider } from "./numeric-slider";
import { SvgSymbolContext, swapColors } from "./svg-symbol";

export const SymbolContextWidget: React.FC<{
  ctx: SvgSymbolContext;
  onChange: (value: SvgSymbolContext) => void;
  children?: any;
}> = ({ ctx, children, onChange }) => {
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
};
