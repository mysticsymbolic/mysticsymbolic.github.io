import React, { useContext, useMemo } from "react";

type UniqueIdContextType = {
  prefix: string;
  counter: number;
};

const UniqueIdContext = React.createContext<UniqueIdContextType>({
  prefix: "uid_",
  counter: 0,
});

function useUniqueIds(count: number): string[] {
  const ctx = useContext(UniqueIdContext);
  const result = useMemo<string[]>(() => {
    const result: string[] = [];

    for (let i = 0; i < count; i++) {
      result.push(`${ctx.prefix}${ctx.counter}`);
      ctx.counter += 1;
    }

    return result;
  }, [count, ctx]);

  return result;
}

export class UniqueIdMap extends Map<string, string> {
  /**
   * Returns the globally-unique identifier for the given
   * locally-unique one, raising an exception if one
   * doesn't exist.
   */
  getStrict(key: string): string {
    const uid = this.get(key);

    if (!uid) {
      throw new Error(`Unable to find a unique ID for "${key}"`);
    }

    return uid;
  }

  /**
   * If the given string is of the form `url(#id)`, where `id` is a
   * locally-unique identifier, then this will replace `id` with
   * its globally-unique analogue.  If it does not have a
   * globally-unique identifier for it, however, an error will be
   * raised.
   *
   * If the string is *not* of the aforementioned form, however,
   * it will be returned unmodified.
   *
   * This can be used to e.g. rewrite references in SVG attributes
   * that may refer to locally-unique identifiers.
   */
  rewriteUrl(value: string): string {
    const match = value.match(/^url\(\#(.+)\)$/);

    if (!match) {
      return value;
    }

    const uid = this.getStrict(match[1]);

    return `url(#${uid})`;
  }
}

/**
 * We sometimes need to take locally-unique identifiers and make them
 * globally-unique within some larger context; for example, an individual
 * SVG may have defined a `<radialGradient id="boop">` where `#boop` is
 * unique to the SVG, but if we want to inline the SVG into an HTML page,
 * it may no longer be unique.
 *
 * This React Hook takes an array of locally-unique identifiers and returns
 * a mapping between them and globally-unique ones.
 */
export function useUniqueIdMap(originalIds: string[]): UniqueIdMap {
  const uniqueIds = useUniqueIds(originalIds.length);

  return useMemo(
    () => new UniqueIdMap(originalIds.map((id, i) => [id, uniqueIds[i]])),
    [originalIds, uniqueIds]
  );
}
