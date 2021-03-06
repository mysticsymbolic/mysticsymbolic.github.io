import React from "react";
import { SvgSymbolContext, swapColors } from "./svg-symbol";
import { float } from "./util";

export const SymbolContextWidget: React.FC<{
  ctx: SvgSymbolContext;
  onChange: (value: SvgSymbolContext) => void;
  children?: any;
}> = ({ ctx, children, onChange }) => {
  const updateCtx = (updates: Partial<SvgSymbolContext>) => {
    onChange({ ...ctx, ...updates });
  };

  return (
    <p>
      {children}
      <label htmlFor="stroke">Stroke: </label>
      <input
        type="color"
        value={ctx.stroke}
        onChange={(e) => updateCtx({ stroke: e.target.value })}
        id="stroke"
      />{" "}
      <label htmlFor="fill">Fill: </label>
      <input
        type="color"
        value={ctx.fill}
        onChange={(e) => updateCtx({ fill: e.target.value })}
        id="fill"
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
          <label htmlFor="strokeWidth">Stroke width: </label>
          <input
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={ctx.uniformStrokeWidth}
            onChange={(e) =>
              updateCtx({ uniformStrokeWidth: float(e.target.value) })
            }
          />{" "}
          {ctx.uniformStrokeWidth}{" "}
        </>
      )}
    </p>
  );
};
