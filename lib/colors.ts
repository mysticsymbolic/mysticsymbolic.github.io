import type { AttachmentPointType } from "./specs";

export const STROKE_REPLACEMENT_COLOR = "#000000";
export const FILL_REPLACEMENT_COLOR = "#ffffff";

export const ATTACHMENT_POINT_COLORS: {
  [key in AttachmentPointType]: string;
} = {
  anchor: "#ff0000",
  tail: "#be0027",
  leg: "#ffff00",
  arm: "#00ff00",
  horn: "#00ffff",
  crown: "#0000ff",
};

export const NESTING_BOUNDING_BOX_COLOR = "#ff00ff";
