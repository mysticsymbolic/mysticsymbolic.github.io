import { Point } from "../vendor/bezier-js";
import { normalizedPoint2rad, subtractPoints } from "./point";
import { PointWithNormal } from "./specs";
import { rad2deg } from "./util";

const ROTATION_ORIGIN_DEG = 90;

function normalizeDeg(deg: number): number {
  deg = deg % 360;
  if (deg < 0) {
    deg = 360 + deg;
  }
  return deg;
}

export function normalToAttachmentSpaceDegrees(normal: Point): number {
  const yFlipped: Point = {
    x: normal.x,
    y: -normal.y,
  };
  const rad = normalizedPoint2rad(yFlipped);
  const reoriented = normalizeDeg(ROTATION_ORIGIN_DEG - rad2deg(rad));
  return reoriented;
}

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
