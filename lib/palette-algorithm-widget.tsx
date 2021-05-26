import React, {useEffect, useState} from "react";
import {
  RandomPaletteAlgorithm,
  RANDOM_PALETTE_ALGORITHMS, PaletteAlgorithmConfig,
} from "./random-colors";

export type PaletteAlgorithmWidgetProps = {
  value: RandomPaletteAlgorithm;
  onChange: (value: RandomPaletteAlgorithm) => void;
  onPaletteConfigChange: (value: PaletteAlgorithmConfig) => void;
};

export const PaletteAlgorithmWidget: React.FC<PaletteAlgorithmWidgetProps> = ({
  value,
  onChange,
  onPaletteConfigChange = () => {}
}) => {
  const id = "algorithm";
  const [paletteConfig, setPaletteConfig] = useState<PaletteAlgorithmConfig>({
    hue: 120,
    hueInterval: 15,
    saturation: 50,
    valueMin: 20,
    valueMax: 80,
  });
  useEffect(() => {
    onPaletteConfigChange(paletteConfig);
  }, [paletteConfig])

  return (
    <div className="flex-widget thingy">
      {value === "threevals" && (
        <div className="flex-widget thingy">
          <label>Hue {paletteConfig.hue}</label>
          <input type="range" min="0" max="360" value={paletteConfig.hue}
                 onChange={(e) => setPaletteConfig({...paletteConfig, hue: Number(e.target.value) }) } />
          <label>Hue Interval {paletteConfig.hueInterval}</label>
          <input type="range" min="0" max="120" value={paletteConfig.hueInterval}
                 onChange={(e) => setPaletteConfig({...paletteConfig, hueInterval: Number(e.target.value) }) }
          />
          <label>Value min {paletteConfig.valueMin}</label>
          <input type="range" min="0" max="100" value={paletteConfig.valueMin}
                 onChange={(e) => setPaletteConfig({...paletteConfig, valueMin: Number(e.target.value) }) }
          />
          <label>Value Max {paletteConfig.valueMax}</label>
          <input type="range" min="0" max="100" value={paletteConfig.valueMax}
                 onChange={(e) => setPaletteConfig({...paletteConfig, valueMax: Number(e.target.value) }) }
          />
          <label>Saturation {paletteConfig.saturation}</label>
          <input type="range" min="0" max="100" value={paletteConfig.saturation}
                 onChange={(e) => setPaletteConfig({...paletteConfig, saturation: Number(e.target.value) }) }
          /></div>)}
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
