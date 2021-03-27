import React from "react";
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
      <label>
        <input
          type="checkbox"
          checked={ctx.showSpecs}
          onChange={(e) => updateCtx({ showSpecs: e.target.checked })}
        />{" "}
        Show specs
      </label>
      {ctx.uniformStrokeWidth !== undefined && (
        <>
          <br />
          <NumericSlider
            label="Stroke width"
            min={0}
            max={3}
            step={0.1}
            value={ctx.uniformStrokeWidth}
            onChange={(uniformStrokeWidth) => updateCtx({ uniformStrokeWidth })}
          />{" "}
        </>
      )}
    </div>
  );
};
