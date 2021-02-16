import { Point } from "../vendor/bezier-js";
import { normalizedPoint2rad, scalePointXY, subtractPoints } from "./point";
import { PointWithNormal } from "./specs";
import { rad2deg } from "./util";

function normalizeDeg(deg: number): number {
  deg = deg % 360;
  if (deg < 0) {
    deg = 360 + deg;
  }
  return deg;
}

/**
 * Convert the given normal in screen-space coordinates into
 * degrees of rotation in attachment-space coordinates.
 */
export function normalToAttachmentSpaceDegrees(normal: Point): number {
  // We need to flip our y because we're in screen space, yet our
  // rotational math assumes we're not.
  const yFlipped = scalePointXY(normal, 1, -1);

  const rad = normalizedPoint2rad(yFlipped);

  // The origin of our rotation space assumes that "up" is 0
  // degrees, while our rotational math assumes 0 degrees is "right".
  const reoriented = normalizeDeg(90 - rad2deg(rad));

  return reoriented;
}

/**
 * Given a child point that needs to be attached to a parent
 * point, return the amount of translation and rotation we
 * need to apply to the child point in order to align its
 * position and normal with that of its parent.
 */
export function getAttachmentTransforms(
  parent: PointWithNormal,
  child: PointWithNormal
) {
  const translation = subtractPoints(parent.point, child.point);
  const parentRot = normalToAttachmentSpaceDegrees(parent.normal);
  const childRot = normalToAttachmentSpaceDegrees(child.normal);
  const rotation = parentRot - childRot;
  return { translation, rotation };
}
