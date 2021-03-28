import React, { useContext, useState } from "react";
import { AutoSizingSvg } from "../auto-sizing-svg";
import { CreatureContext, CreatureContextType } from "../creature-symbol";
import { createCreatureSymbolFactory } from "../creature-symbol-factory";
import { HoverDebugHelper } from "../hover-debug-helper";
import { createSvgSymbolContext } from "../svg-symbol";
import { svgScale, SvgTransform } from "../svg-transform";
import { SvgVocabulary } from "../svg-vocabulary";
import { SymbolContextWidget } from "../symbol-context-widget";

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

export const DebugPage: React.FC<{}> = () => {
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());
  const defaultCtx = useContext(CreatureContext);
  const ctx: CreatureContextType = {
    ...defaultCtx,
    ...symbolCtx,
    fill: symbolCtx.showSpecs ? "none" : symbolCtx.fill,
  };

  return (
    <>
      <h1>Debug!</h1>
      <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx} />
      <CreatureContext.Provider value={ctx}>
        <HoverDebugHelper>
          <AutoSizingSvg padding={20}>
            <SvgTransform transform={svgScale(0.5)}>
              {EYE_CREATURE}
            </SvgTransform>
          </AutoSizingSvg>
        </HoverDebugHelper>
      </CreatureContext.Provider>
    </>
  );
};
