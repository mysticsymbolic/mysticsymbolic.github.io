import React, {useEffect, useState} from "react";
import { PaletteAlgorithmWidget } from "./palette-algorithm-widget";
import { Random } from "./random";
import {
  createRandomColorPalette,
  DEFAULT_RANDOM_PALETTE_ALGORITHM, PaletteAlgorithmConfig,
  RandomPaletteAlgorithm,
} from "./random-colors";
import { SvgCompositionContext } from "./svg-composition-context";

type SvgCompositionColors = Pick<
  SvgCompositionContext,
  "background" | "fill" | "stroke"
>;

function createRandomCompositionColors(
  alg: RandomPaletteAlgorithm,
  config?: PaletteAlgorithmConfig
): SvgCompositionColors {
  const [background, stroke, fill] = createRandomColorPalette(
    3,
    undefined,
    alg,
    config
  );
  return { background, stroke, fill };
}

export type RandomizerWidgetProps = {
  onColorsChange: (changes: SvgCompositionColors) => void;
  onSymbolsChange: (rng: Random) => void;
};

export const RandomizerWidget: React.FC<RandomizerWidgetProps> = (props) => {
  type RandType = "colors" | "symbols" | "colors and symbols";
  const [paletteAlg, setPaletteAlg] = useState<RandomPaletteAlgorithm>(
    DEFAULT_RANDOM_PALETTE_ALGORITHM
  );
  const [paletteConfig, setPaletteConfig] = useState({})
  const [randType, setRandType] = useState<RandType>("colors and symbols");
  const randomize = () => {
    if (randType === "colors" || randType === "colors and symbols") {
      props.onColorsChange(createRandomCompositionColors(paletteAlg, paletteConfig));
    }
    if (randType === "symbols" || randType === "colors and symbols") {
      props.onSymbolsChange(new Random(Date.now()));
    }
  };
  useEffect(() => {
    props.onColorsChange(createRandomCompositionColors(paletteAlg, paletteConfig));
  }, [paletteConfig])
  const makeRadio = (kind: RandType) => (
    <label className="checkbox">
      <input
        type="radio"
        name="randomize_type"
        value={kind}
        checked={randType === kind}
        onChange={(e) => setRandType(e.target.value as RandType)}
      />{" "}
      Randomize {kind}
    </label>
  );

  return (
    <fieldset>
      <legend>Randomizer</legend>
      {makeRadio("colors")}
      {makeRadio("symbols")}
      {makeRadio("colors and symbols")}
      {randType !== "symbols" && (
        <PaletteAlgorithmWidget value={paletteAlg} onChange={setPaletteAlg} onPaletteConfigChange={setPaletteConfig} />
      )}
      {props.children}
      <button accessKey="r" onClick={randomize}>
        <u>R</u>andomize!
      </button>
    </fieldset>
  );
};
