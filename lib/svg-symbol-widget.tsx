import React, { useMemo } from "react";
import { SvgSymbolData } from "./svg-symbol";
import { slugify } from "./util";

export type SvgSymbolWidgetProps = {
  id?: string;
  label: string;
  value: SvgSymbolData;
  onChange: (value: SvgSymbolData) => void;
  choices: SvgSymbolData[];
};

export const SvgSymbolWidget: React.FC<SvgSymbolWidgetProps> = ({
  id,
  label,
  value,
  onChange,
  choices,
}) => {
  id = id || slugify(label);
  const symbolMap = useMemo(
    () => new Map(choices.map((symbol) => [symbol.name, symbol])),
    [choices]
  );
  const handleChange = (value: string) => {
    const symbol = symbolMap.get(value);
    if (!symbol) throw new Error(`Unable to find "${value}"`);
    onChange(symbol);
  };

  return (
    <>
      <label htmlFor={id}>{label}: </label>
      <select
        id={id}
        onChange={(e) => handleChange(e.target.value)}
        value={value.name}
      >
        {choices.map((choice) => (
          <option key={choice.name} value={choice.name}>
            {choice.name}
          </option>
        ))}
      </select>
    </>
  );
};
