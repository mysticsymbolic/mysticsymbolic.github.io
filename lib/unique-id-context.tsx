import React, { useContext, useState } from "react";

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
  const result = useState<string[]>(() => {
    const result: string[] = [];

    for (let i = 0; i < count; i++) {
      result.push(`${ctx.prefix}${ctx.counter}`);
      ctx.counter += 1;
    }

    return result;
  })[0];

  return result;
}

export const UniqueIdContextProvider: React.FC<{ prefix?: string }> = (
  props
) => (
  <UniqueIdContext.Provider value={{ counter: 0, prefix: props.prefix || "" }}>
    {props.children}
  </UniqueIdContext.Provider>
);
