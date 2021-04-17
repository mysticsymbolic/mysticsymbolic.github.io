import React from "react";
import {
  RandomPaletteAlgorithm,
  RANDOM_PALETTE_ALGORITHMS,
} from "./random-colors";

export type PaletteAlgorithmWidgetProps = {
  value: RandomPaletteAlgorithm;
  onChange: (value: RandomPaletteAlgorithm) => void;
};

export const PaletteAlgorithmWidget: React.FC<PaletteAlgorithmWidgetProps> = ({
  value,
  onChange,
}) => {
  const id = "algorithm";

  return (
    <div className="flex-widget thingy">
      <label htmlFor={id}>Palette algorithm: </label>
      <select
        id={id}
        onChange={(e) => onChange(e.target.value as RandomPaletteAlgorithm)}
        value={value}
      >
        {RANDOM_PALETTE_ALGORITHMS.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
    </div>
  );
};
