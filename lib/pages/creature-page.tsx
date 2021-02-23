import React, { useContext, useEffect, useRef, useState } from "react";
import { SvgVocabulary } from "../svg-vocabulary";
import {
  createSvgSymbolContext,
  SvgSymbolContent,
  SvgSymbolContext,
  SvgSymbolData,
} from "../svg-symbol";
import {
  AttachmentPointType,
  iterAttachmentPoints,
  PointWithNormal,
} from "../specs";
import { getAttachmentTransforms } from "../attach";
import { scalePointXY } from "../point";
import { Point } from "../../vendor/bezier-js";
import { Random } from "../random";
import { SymbolContextWidget } from "../symbol-context-widget";
import { range } from "../util";

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
      `Expected symbol ${s.name} to have at least ${
        idx + 1
      } ${type} attachment point(s)!`
    );
  }

  return points[idx];
}

function safeGetAttachmentPoint(
  s: SvgSymbolData,
  type: AttachmentPointType,
  idx: number = 0
): PointWithNormal | null {
  try {
    return getAttachmentPoint(s, type, idx);
  } catch (e) {
    console.error(e);
  }

  return null;
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

type AttachmentIndices = {
  left?: boolean;
  right?: boolean;
};

type CreatureSymbolProps = AttachmentIndices & {
  data: SvgSymbolData;
  children?: AttachmentChildren;
  attachTo?: AttachmentPointType;
  indices?: number[];
};

function getAttachmentIndices(ai: AttachmentIndices): number[] {
  const result: number[] = [];

  if (ai.left) {
    result.push(0);
  }
  if (ai.right) {
    result.push(1);
  }
  if (result.length === 0) {
    result.push(0);
  }
  return result;
}

const CreatureSymbol: React.FC<CreatureSymbolProps> = (props) => {
  const ctx = useContext(CreatureContext);
  const { data, attachTo } = props;
  const ourSymbol = (
    <>
      {props.children && (
        <CreatureContext.Provider
          value={{
            ...ctx,
            parent: data,
          }}
        >
          {props.children}
        </CreatureContext.Provider>
      )}
      <SvgSymbolContent data={data} {...ctx} />
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

  const attachmentIndices = props.indices || getAttachmentIndices(props);
  const children: JSX.Element[] = [];

  for (let attachIndex of attachmentIndices) {
    const parentAp = safeGetAttachmentPoint(parent, attachTo, attachIndex);
    const ourAp = safeGetAttachmentPoint(data, "anchor");

    if (!parentAp || !ourAp) {
      continue;
    }

    // If we're attaching something oriented towards the left, horizontally flip
    // the attachment image.
    let xFlip = parentAp.normal.x < 0 ? -1 : 1;

    // Er, things look weird if we don't inverse the flip logic for
    // the downward-facing attachments, like legs...
    if (parentAp.normal.y > 0) {
      xFlip *= -1;
    }

    const t = getAttachmentTransforms(parentAp, {
      point: ourAp.point,
      normal: scalePointXY(ourAp.normal, xFlip, 1),
    });

    children.push(
      <AttachmentTransform
        key={attachIndex}
        transformOrigin={ourAp.point}
        translate={t.translation}
        scale={{ x: ctx.attachmentScale * xFlip, y: ctx.attachmentScale }}
        rotate={xFlip * t.rotation}
      >
        {ourSymbol}
      </AttachmentTransform>
    );
  }

  return <>{children}</>;
};

type AttachmentTransformProps = {
  transformOrigin: Point;
  translate: Point;
  scale: Point;
  rotate: number;
  children: JSX.Element;
};

const AttachmentTransform: React.FC<AttachmentTransformProps> = (props) => (
  <g transform={`translate(${props.translate.x} ${props.translate.y})`}>
    {/**
     * We originally used "transform-origin" here but that's not currently
     * supported by Safari. Instead, we'll set the origin of our symbol to
     * the transform origin, do the transform, and then move our origin back to
     * the original origin, which is equivalent to setting "transform-origin".
     **/}
    <g
      transform={`translate(${props.transformOrigin.x} ${props.transformOrigin.y})`}
    >
      <g
        transform={`scale(${props.scale.x} ${props.scale.y}) rotate(${props.rotate})`}
      >
        <g
          transform={`translate(-${props.transformOrigin.x} -${props.transformOrigin.y})`}
        >
          {props.children}
        </g>
      </g>
    </g>
  </g>
);

type CreatureSymbolWithDefaultProps = Omit<CreatureSymbolProps, "data"> & {
  data?: SvgSymbolData;
};

function createCreatureSymbol(
  name: string
): React.FC<CreatureSymbolWithDefaultProps> {
  const data = getSymbol(name);
  return (props) => <CreatureSymbol data={props.data || data} {...props} />;
}

const Eye = createCreatureSymbol("eye");

const Hand = createCreatureSymbol("hand");

const Arm = createCreatureSymbol("arm");

const Antler = createCreatureSymbol("antler");

const Crown = createCreatureSymbol("crown");

const Wing = createCreatureSymbol("wing");

const MuscleArm = createCreatureSymbol("muscle_arm");

const Leg = createCreatureSymbol("leg");

const Tail = createCreatureSymbol("tail");

function getSymbolWithAttachments(
  numAttachmentKinds: number,
  rng: Random
): JSX.Element {
  const children: JSX.Element[] = [];
  const root = rng.choice(SvgVocabulary);
  if (root.specs) {
    const attachmentKinds = rng.uniqueChoices(
      Array.from(iterAttachmentPoints(root.specs)).map((point) => point.type),
      numAttachmentKinds
    );
    for (let kind of attachmentKinds) {
      const attachment = rng.choice(SvgVocabulary);
      const indices = range(root.specs[kind]?.length ?? 0);
      children.push(
        <CreatureSymbol
          data={attachment}
          key={children.length}
          attachTo={kind}
          indices={indices}
        />
      );
    }
  }
  return <CreatureSymbol data={root} children={children} />;
}

const EYE_CREATURE = (
  <Eye>
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
    <Tail attachTo="tail" />
  </Eye>
);

function randomlyReplaceParts(rng: Random, creature: JSX.Element): JSX.Element {
  return React.cloneElement<CreatureSymbolWithDefaultProps>(creature, {
    data: rng.choice(SvgVocabulary),
    children: React.Children.map(creature.props.children, (child, i) => {
      return randomlyReplaceParts(rng, child);
    }),
  });
}

type CreatureGenerator = (rng: Random) => JSX.Element;

const COMPLEXITY_LEVEL_GENERATORS: CreatureGenerator[] = [
  ...range(5).map((i) => getSymbolWithAttachments.bind(null, i)),
  (rng) => randomlyReplaceParts(rng, EYE_CREATURE),
];

const MAX_COMPLEXITY_LEVEL = COMPLEXITY_LEVEL_GENERATORS.length - 1;

function getSvgMarkup(el: SVGSVGElement): string {
  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    "<!-- Generator: https://github.com/toolness/mystic-symbolic -->",
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    el.outerHTML,
  ].join("\n");
}

function exportSvg(filename: string, svgRef: React.RefObject<SVGSVGElement>) {
  const svgEl = svgRef.current;
  if (!svgEl) {
    alert("Oops, an error occurred! Please try again later.");
    return;
  }
  const dataURL = `data:image/svg+xml;utf8,${encodeURIComponent(
    getSvgMarkup(svgEl)
  )}`;
  const anchor = document.createElement("a");
  anchor.href = dataURL;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

const AutoSizingSvg = React.forwardRef(
  (
    props: {
      padding: number;
      bgColor?: string;
      children: JSX.Element | JSX.Element[];
    },
    ref: React.ForwardedRef<SVGSVGElement>
  ) => {
    const { bgColor, padding } = props;
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [width, setWidth] = useState(1);
    const [height, setHeight] = useState(1);
    const gRef = useRef<SVGGElement>(null);

    useEffect(() => {
      const svgEl = gRef.current;
      if (svgEl) {
        const bbox = svgEl.getBBox();
        setX(bbox.x - padding);
        setY(bbox.y - padding);
        setWidth(bbox.width + padding * 2);
        setHeight(bbox.height + padding * 2);
      }
    });

    return (
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width={`${width}px`}
        height={`${height}px`}
        viewBox={`${x} ${y} ${width} ${height}`}
        ref={ref}
      >
        {bgColor && (
          <rect x={x} y={y} width={width} height={height} fill={bgColor} />
        )}
        <g ref={gRef}>{props.children}</g>
      </svg>
    );
  }
);

function getDownloadFilename(randomSeed: number | null) {
  let downloadBasename = "mystic-symbolic-creature";

  if (randomSeed !== null) {
    downloadBasename += `-${randomSeed}`;
  }

  return `${downloadBasename}.svg`;
}

export const CreaturePage: React.FC<{}> = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [randomSeed, setRandomSeed] = useState<number | null>(null);
  const [symbolCtx, setSymbolCtx] = useState(createSvgSymbolContext());
  const [complexity, setComplexity] = useState(MAX_COMPLEXITY_LEVEL);
  const defaultCtx = useContext(CreatureContext);
  const newRandomSeed = () => setRandomSeed(Date.now());
  const ctx: CreatureContextType = {
    ...defaultCtx,
    ...symbolCtx,
    fill: symbolCtx.showSpecs ? "none" : symbolCtx.fill,
  };
  const creature =
    randomSeed === null
      ? EYE_CREATURE
      : COMPLEXITY_LEVEL_GENERATORS[complexity](new Random(randomSeed));
  const handleSvgExport = () =>
    exportSvg(getDownloadFilename(randomSeed), svgRef);

  return (
    <>
      <h1>Creature!</h1>
      <SymbolContextWidget ctx={symbolCtx} onChange={setSymbolCtx}>
        <label htmlFor="bgColor">Background: </label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
        />{" "}
      </SymbolContextWidget>
      <p>
        <label htmlFor="complexity">Random creature complexity: </label>
        <input
          type="range"
          min={0}
          max={MAX_COMPLEXITY_LEVEL}
          step={1}
          value={complexity}
          onChange={(e) => {
            setComplexity(parseInt(e.target.value));
            newRandomSeed();
          }}
        />{" "}
        {complexity === MAX_COMPLEXITY_LEVEL ? "bonkers" : complexity}
      </p>
      <p>
        <button accessKey="r" onClick={newRandomSeed}>
          <u>R</u>andomize!
        </button>{" "}
        <button onClick={() => window.location.reload()}>Reset</button>{" "}
        <button onClick={handleSvgExport}>Export SVG</button>
      </p>
      <CreatureContext.Provider value={ctx}>
        <AutoSizingSvg padding={20} ref={svgRef} bgColor={bgColor}>
          <g transform="scale(0.5 0.5)">{creature}</g>
        </AutoSizingSvg>
      </CreatureContext.Provider>
    </>
  );
};
