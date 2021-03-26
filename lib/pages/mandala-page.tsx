import React from "react";
import { AutoSizingSvg } from "../auto-sizing-svg";
import { createCreatureSymbolFactory } from "../creature-symbol-factory";
import { getSvgSymbol } from "../svg-vocabulary";

const symbol = createCreatureSymbolFactory(getSvgSymbol);

const Eye = symbol("eye");

export const MandalaPage: React.FC<{}> = () => {
  return (
    <>
      <h1>Mandala!</h1>
      <AutoSizingSvg padding={20}>
        <Eye />
      </AutoSizingSvg>
    </>
  );
};
