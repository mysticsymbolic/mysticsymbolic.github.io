import { useCallback, useState } from "react";

/**
 * This is where we remember the most recently-set values
 * for `useRememberedState`.
 */
const shortTermMemory = new Map<string, any>();

/**
 * This is like React's `useState()`, but it also takes a "key" which
 * uniquely identifies the state's value globally across the whole
 * application.
 *
 * The most recent value is always remembered for the lifetime of the
 * current application (but not across page reloads) and is returned
 * instead of the initial state if possible.
 *
 * This effectively allows us to have user interface elements that
 * "remember" their most recent value, even if the UI itself was
 * unmounted at some point.
 */
export function useRememberedState<S>(
  key: string,
  initialState: S | (() => S)
): [S, (value: S) => void] {
  const remembered = shortTermMemory.get(key);
  const [value, rawSetValue] = useState<S>(
    remembered === undefined ? initialState : remembered
  );
  const setValue = useCallback(
    (value: S) => {
      shortTermMemory.set(key, value);
      rawSetValue(value);
    },
    [key, rawSetValue]
  );

  return [value, setValue];
}
