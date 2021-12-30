import { getBoundingBoxCenter } from "./bounding-box";
import { SvgSymbolData } from "./svg-symbol";
import {
  svgRotate,
  SvgTransform,
  svgTransformOrigin,
  svgTranslate,
} from "./svg-transform";

type AnimationTransformer = (
  animPct: number,
  symbol: SvgSymbolData
) => SvgTransform[];

export interface CreatureAnimator {
  getSvgTransforms: AnimationTransformer;
  getChildAnimator(): CreatureAnimator;
}

/**
 * Any function that takes a number in the range [0, 1] and
 * transforms it to a number in the same range, for the
 * purposes of animation easing.
 */
type EasingFunction = (t: number) => number;

// https://gist.github.com/gre/1650294
const easeInOutQuad: EasingFunction = (t) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/**
 * Ease from 0, get to 1 by the time t=0.5, and then
 * ease back to 0.
 */
const easeInOutQuadPingPong: EasingFunction = (t) => {
  if (t < 0.5) {
    return easeInOutQuad(t * 2);
  }
  return 1 - easeInOutQuad((t - 0.5) * 2);
};

/**
 * Convert a percentage (number in the range [0, 1]) to
 * a number in the range [-1, 1].
 */
function pctToNegativeOneToOne(pct: number) {
  return (pct - 0.5) * 2;
}

const Y_HOVER_AMPLITUDE = 25.0;

const hoverTransformer: AnimationTransformer = (animPct) => {
  const yHover =
    pctToNegativeOneToOne(easeInOutQuadPingPong(animPct)) * Y_HOVER_AMPLITUDE;
  return [svgTranslate({ x: 0, y: yHover })];
};

const spinTransformer: AnimationTransformer = (animPct, symbol) => {
  const origin = getBoundingBoxCenter(symbol.bbox);
  return [svgTransformOrigin(origin, [svgRotate(animPct * 360)])];
};

export const hoverAnimator: CreatureAnimator = {
  getSvgTransforms: hoverTransformer,
  getChildAnimator: () => hoverAnimator,
};

const spinAnimator: CreatureAnimator = {
  getSvgTransforms: spinTransformer,
  getChildAnimator: () => spinAnimator,
};

export const hoverAndSpinAnimator: CreatureAnimator = {
  getSvgTransforms: hoverTransformer,
  getChildAnimator: () => spinAnimator,
};

export const nullAnimator: CreatureAnimator = {
  getSvgTransforms: () => [],
  getChildAnimator: () => nullAnimator,
};
