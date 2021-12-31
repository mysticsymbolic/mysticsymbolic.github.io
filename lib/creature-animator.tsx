import { getBoundingBoxCenter } from "./bounding-box";
import { SvgSymbolData } from "./svg-symbol";
import {
  svgRotate,
  SvgTransform,
  svgTransformOrigin,
  svgTranslate,
} from "./svg-transform";

/**
 * A type of function that tells us how to transform a creature based
 * on how far through an animation we are.
 */
type CreatureAnimate = (
  animPct: number,
  symbol: SvgSymbolData
) => SvgTransform[];

/**
 * A strategy for animating a creature.
 */
export interface CreatureAnimator {
  /** How to animate the main body of the creature. */
  animate: CreatureAnimate;

  /** How to animate the children (attachments & nests) of the creature. */
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

const animateHover: CreatureAnimate = (animPct) => {
  const yHover =
    pctToNegativeOneToOne(easeInOutQuadPingPong(animPct)) * Y_HOVER_AMPLITUDE;
  return [svgTranslate({ x: 0, y: yHover })];
};

const animateSpin: CreatureAnimate = (animPct, symbol) => {
  const origin = getBoundingBoxCenter(symbol.bbox);
  return [svgTransformOrigin(origin, [svgRotate(animPct * 360)])];
};

const spinAnimator: CreatureAnimator = {
  animate: animateSpin,
  getChildAnimator: () => spinAnimator,
};

/**
 * Names of all the animators.
 *
 * Note that this list should never be re-ordered, as the index of
 * each animator corresponds to its animator id.
 */
export const CREATURE_ANIMATOR_NAMES = ["none", "breathe", "spin"] as const;

export type CreatureAnimatorName = typeof CREATURE_ANIMATOR_NAMES[number];

export function creatureAnimatorNameToId(name: CreatureAnimatorName): number {
  return CREATURE_ANIMATOR_NAMES.indexOf(name);
}

export function creatureAnimatorIdToName(
  id: number
): CreatureAnimatorName | undefined {
  return CREATURE_ANIMATOR_NAMES[id];
}

export const CreatureAnimators: {
  [k in CreatureAnimatorName]: CreatureAnimator;
} = {
  none: {
    animate: () => [],
    getChildAnimator: () => CreatureAnimators.none,
  },
  breathe: {
    animate: animateHover,
    getChildAnimator: () => CreatureAnimators.breathe,
  },
  spin: {
    animate: animateHover,
    getChildAnimator: () => spinAnimator,
  },
};
