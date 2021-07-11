import { AttachmentPointType, isAttachmentPointType } from "./specs";

type SvgSymbolMetadataBooleans = {
  /**
   * If true, this indicates that the symbol should always have
   * a symbol nested within its nesting area(s).
   */
  always_nest?: boolean;

  /**
   * If true, this indicates that the symbol should always
   * be nested inside another symbol's nesting area.
   */
  always_be_nested?: boolean;

  /**
   * If true, this indicates that the symbol should never
   * be nested inside another symbol's nesting area.
   */
  never_be_nested?: boolean;

  /**
   * If true, this indicates that any symbols nested on this
   * symbol’s nesting area should have their colors inverted.
   */
  invert_nested?: boolean;

  /**
   * In the mandala, the normal rotation direction for animation is counterclockwise.
   * This changes the rotation direction to clockwise.
   */
  rotate_clockwise?: boolean;

  /**
   * If true, this indicates that we should never horizontally flip the
   * orientation of a symbol when attaching it.  Otherwise, we will flip
   * the symbol horizontally if it's facing left, and flip it horizontally
   * again if it's facing down.
   */
  never_flip_attachments?: boolean;
};

const METADATA_BOOLEANS: Set<keyof SvgSymbolMetadataBooleans> = new Set([
  "always_nest",
  "always_be_nested",
  "never_be_nested",
  "invert_nested",
  "rotate_clockwise",
  "never_flip_attachments",
]);

function isSvgSymbolMetadataBoolean(
  key: string
): key is keyof SvgSymbolMetadataBooleans {
  return METADATA_BOOLEANS.has(key as any);
}

export type SvgSymbolMetadata = SvgSymbolMetadataBooleans & {
  /**
   * If defined, this indicates the kinds of attachment points
   * that this symbol can attach to.  If not defined, it will
   * be able to attach to any symbol.
   */
  attach_to?: AttachmentPointType[];

  /**
   * Setting this to a positive integer (whole number) will multiply the
   * likelihood that this symbol will be chosen from a random selection of symbols
   * by the given amount. For example, setting it to 2 will make it twice as
   * likely to be chosen, setting it to 5 will make it five times more likely,
   * and so on.
   */
  frequency_multiplier?: number;
};

export function validateSvgSymbolMetadata(obj: any): {
  metadata: SvgSymbolMetadata;
  unknownProperties: string[];
} {
  const metadata: SvgSymbolMetadata = {};
  const unknownProperties: string[] = [];
  for (let key in obj) {
    const value: unknown = obj[key];
    if (isSvgSymbolMetadataBoolean(key)) {
      if (typeof value !== "boolean") {
        throw new Error(
          `Expected "${key}" to be a boolean, but it is a ${typeof value}!`
        );
      }
      metadata[key] = value;
    } else if (key === "attach_to") {
      metadata.attach_to = validateAttachTo(obj[key]);
    } else if (key === "frequency_multiplier") {
      metadata.frequency_multiplier = validateFrequencyMultiplier(obj[key]);
    } else {
      unknownProperties.push(key);
    }
  }
  return { metadata, unknownProperties };
}

const MIN_FREQUENCY_MULTIPLIER = 1;

function validateFrequencyMultiplier(value: unknown): number | undefined {
  if (typeof value === "number") {
    if (value < MIN_FREQUENCY_MULTIPLIER) {
      console.log(
        `Frequency multiplier is less than minimum of ${MIN_FREQUENCY_MULTIPLIER}.`
      );
      return MIN_FREQUENCY_MULTIPLIER;
    }
    return Math.floor(value);
  }
  console.log(`Frequency multiplier "${value}" is not a number.`);
  return undefined;
}

export function validateAttachTo(value: unknown): AttachmentPointType[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `Expected "attach_to" to be an array, but it is a ${typeof value}!`
    );
  }

  const result: AttachmentPointType[] = [];

  for (let item of value) {
    if (isAttachmentPointType(item)) {
      result.push(item);
    } else {
      console.log(
        `Item '${item}' in "attach_to" is not a valid attachment point.`
      );
    }
  }

  return result;
}
