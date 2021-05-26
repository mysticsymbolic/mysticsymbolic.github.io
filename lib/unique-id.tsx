import React, { useContext, useMemo } from "react";

type UniqueIdContextType = {
  prefix: string;
  counter: number;
};

const UniqueIdContext = React.createContext<UniqueIdContextType>({
  prefix: "",
  counter: 0,
});

export function useUniqueIds(count: number): string[] {
  const ctx = useContext(UniqueIdContext);
  const result = useMemo<string[]>(() => {
    const result: string[] = [];

    for (let i = 0; i < count; i++) {
      result.push(`${ctx.prefix}${ctx.counter}`);
      ctx.counter += 1;
    }

    return result;
  }, [count]);

  return result;
}

export const UniqueIdContextProvider: React.FC<{ prefix?: string }> = (
  props
) => (
  <UniqueIdContext.Provider value={{ counter: 0, prefix: props.prefix || "" }}>
    {props.children}
  </UniqueIdContext.Provider>
);

export class UniqueIdMap extends Map<string, string> {
  getStrict(key: string): string {
    const uid = this.get(key);

    if (!uid) {
      throw new Error(`Unable to find a unique ID for "${key}"`);
    }

    return uid;
  }

  mungeUrl(value: string): string {
    const match = value.match(/^url\(\#(.+)\)$/);

    if (!match) {
      return value;
    }

    const uid = this.getStrict(match[1]);

    return `url(#${uid})`;
  }
}

export function useUniqueIdMap(originalIds: string[]): UniqueIdMap {
  const uniqueIds = useUniqueIds(originalIds.length);

  return useMemo(
    () => new UniqueIdMap(originalIds.map((id, i) => [id, uniqueIds[i]])),
    [originalIds]
  );
}
