import React, { useContext } from "react";
import { SvgVocabulary } from "../svg-vocabulary";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolContext,
  SvgSymbolData,
} from "../svg-symbol";
import { AttachmentPointType, PointWithNormal } from "../specs";
import { subtractPoints } from "../point";

const SYMBOL_MAP = new Map(
  SvgVocabulary.map((symbol) => [symbol.name, symbol])
);

function getSymbol(name: string): SvgSymbolData {
  const symbol = SYMBOL_MAP.get(name);
  if (!symbol) {
    throw new Error(`Unable to find the symbol "${name}"!`);
  }
  return symbol;
}

function getAttachmentPoint(
  s: SvgSymbolData,
  type: AttachmentPointType,
  idx: number = 0
): PointWithNormal {
  const { specs } = s;
  if (!specs) {
    throw new Error(`Symbol ${s.name} has no specs!`);
  }
  const points = specs[type];
  if (!(points && points.length > idx)) {
    throw new Error(
      `Symbol ${s.name} must have at least ${
        idx + 1
      } ${type} attachment point(s)!`
    );
  }

  return points[idx];
}

type AttachmentChildren = JSX.Element | JSX.Element[];

type CreatureContextType = SvgSymbolContext & {
  attachmentScale: number;
  parent: SvgSymbolData | null;
};

const DEFAULT_ATTACHMENT_SCALE = 0.5;

const CreatureContext = React.createContext<CreatureContextType>({
  ...createSvgSymbolContext(),
  attachmentScale: DEFAULT_ATTACHMENT_SCALE,
  parent: null,
});

type CreatureSymbolProps = {
  data: SvgSymbolData;
  children?: AttachmentChildren;
  attachTo?: AttachmentPointType;
  attachIndex?: number;
};

const CreatureSymbol: React.FC<CreatureSymbolProps> = (props) => {
  const ctx = useContext(CreatureContext);
  const { data, attachTo, attachIndex } = props;
  const ourSymbol = (
    <>
      <SvgSymbolContent data={data} {...ctx} />
      {props.children && (
        <CreatureContext.Provider value={{ ...ctx, parent: data }}>
          {props.children}
        </CreatureContext.Provider>
      )}
    </>
  );

  if (!attachTo) {
    return ourSymbol;
  }

  const parent = ctx.parent;
  if (!parent) {
    throw new Error(
      `Cannot attach ${props.data.name} because it has no parent!`
    );
  }
  const parentAp = getAttachmentPoint(parent, attachTo, attachIndex);
  const ourAp = getAttachmentPoint(data, "tail");
  const dist = subtractPoints(parentAp.point, ourAp.point);

  return (
    <g transform={`translate(${dist.x} ${dist.y})`}>
      <g
        transform-origin={`${ourAp.point.x} ${ourAp.point.y}`}
        transform={`scale(${ctx.attachmentScale} ${ctx.attachmentScale})`}
      >
        {ourSymbol}
      </g>
    </g>
  );
};

function createCreatureSymbol(
  name: string
): React.FC<Omit<CreatureSymbolProps, "data">> {
  const data = getSymbol(name);
  return (props) => <CreatureSymbol data={data} {...props} />;
}

const Eye = createCreatureSymbol("eye");

const Hand = createCreatureSymbol("hand");

const Cup = createCreatureSymbol("cup");

export const CreaturePage: React.FC<{}> = () => {
  return (
    <>
      <h1>Creature!</h1>
      <svg width="1280px" height="720px">
        <g transform-origin="50% 50%" transform="scale(0.5 0.5)">
          <Eye>
            <Hand attachTo="crown">
              <Cup attachTo="arm" />
            </Hand>
          </Eye>
        </g>
      </svg>
    </>
  );
};
