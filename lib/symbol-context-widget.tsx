import React from "react";
import { SvgSymbolContext } from "./svg-symbol";

export const SymbolContextWidget: React.FC<{
  ctx: SvgSymbolContext;
  onChange: (value: SvgSymbolContext) => void;
}> = ({ ctx, onChange }) => {
  const updateCtx = (updates: Partial<SvgSymbolContext>) => {
    onChange({ ...ctx, ...updates });
  };

  return (
    <p>
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
      <label>
        <input
          type="checkbox"
          checked={ctx.showSpecs}
          onChange={(e) => updateCtx({ showSpecs: e.target.checked })}
        />{" "}
        Show specs
      </label>
    </p>
  );
};
