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
};

const METADATA_BOOLEANS: Set<keyof SvgSymbolMetadataBooleans> = new Set([
  "always_nest",
  "always_be_nested",
]);

function isSvgSymbolMetadataBoolean(
  key: string
): key is keyof SvgSymbolMetadataBooleans {
  return METADATA_BOOLEANS.has(key as any);
}

export type SvgSymbolMetadata = SvgSymbolMetadataBooleans;

export function validateSvgSymbolMetadata(
  obj: any
): { metadata: SvgSymbolMetadata; unknownProperties: string[] } {
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
    } else {
      unknownProperties.push(key);
    }
  }
  return { metadata, unknownProperties };
}
