import React, { useContext, useState } from "react";
import { AutoSizingSvg } from "./auto-sizing-svg";
import { CreatureContext, CreatureContextType } from "./creature-symbol";
import { createCreatureSymbolFactory } from "./creature-symbol-factory";
import { HoverDebugHelper } from "./hover-debug-helper";
import { PaletteAlgorithmWidget } from "./palette-algorithm-widget";
import { Random } from "./random";
import {
  createRandomColorPalette,
  DEFAULT_RANDOM_PALETTE_ALGORITHM,
  RandomPaletteAlgorithm,
} from "./random-colors";
import { createSvgSymbolContext } from "./svg-symbol";
import { svgScale, SvgTransform } from "./svg-transform";
import { SvgVocabulary } from "./svg-vocabulary";
import { SymbolContextWidget } from "./symbol-context-widget";
import { range } from "./util";

const symbol = createCreatureSymbolFactory(SvgVocabulary);

const Eye = symbol("eye");

const Hand = symbol("hand");

const Arm = symbol("arm");

const Antler = symbol("antler");

const Crown = symbol("crown");

const Wing = symbol("wing");

const MuscleArm = symbol("muscle_arm");

const Leg = symbol("leg");

const Tail = symbol("tail");

const Lightning = symbol("lightning");

const EYE_CREATURE = (
  <Eye>
    <Lightning nestInside />
    <Arm attachTo="arm" left>
      <Wing attachTo="arm" left right />
    </Arm>
    <Arm attachTo="arm" right>
      <MuscleArm attachTo="arm" left right />
    </Arm>
    <Antler attachTo="horn" left right />
    <Crown attachTo="crown">
      <Hand attachTo="horn" left right>
        <Arm attachTo="arm" left />
      </Hand>
    </Crown>
    <Leg attachTo="leg" left right />
    <Tail attachTo="tail" invert />
  </Eye>
);

const RandomColorSampling: React.FC<{}> = () => {
  const [paletteAlg, setPaletteAlg] = useState<RandomPaletteAlgorithm>(
    DEFAULT_RANDOM_PALETTE_ALGORITHM
  );
  const [seed, setSeed] = useState(Date.now());
  const NUM_COLORS = 100;
  const rng = new Random(seed);
  const palette = createRandomColorPalette(NUM_COLORS, rng, paletteAlg);

  return (
    <>
      <PaletteAlgorithmWidget value={paletteAlg} onChange={setPaletteAlg} />
      <div className="thingy">
        <div style={{ fontSize: 0 }}>
          {range(NUM_COLORS).map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: palette[i],
                width: "1rem",
                height: "1rem",
                display: "inline-block",
              }}
            />
          ))}
        </div>
      </div>
      <div className="thingy">
        <button onClick={() => setSeed(Date.now())}>Regenerate colors</button>
      </div>
    </>
  );
};

export const Debug: React.FC<{}> = () => {
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());
  const defaultCtx = useContext(CreatureContext);
  const ctx: CreatureContextType = {
    ...defaultCtx,
    ...symbolCtx,
    fill: symbolCtx.showSpecs ? "none" : symbolCtx.fill,
  };

  return (
    <>
      <div className="sidebar">
        <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx} />
        <h2>Random color sampling</h2>
        <RandomColorSampling />
      </div>
      <div className="canvas">
        <CreatureContext.Provider value={ctx}>
          <HoverDebugHelper>
            <AutoSizingSvg padding={20}>
              <SvgTransform transform={svgScale(0.5)}>
                {EYE_CREATURE}
              </SvgTransform>
            </AutoSizingSvg>
          </HoverDebugHelper>
        </CreatureContext.Provider>
      </div>
    </>
  );
};
