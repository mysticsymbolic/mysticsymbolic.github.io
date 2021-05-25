import { useEffect } from "react";

/**
 * Like useEffect(), but ensures that the effect is only
 * called when its dependencies haven't changed for the
 * given number of milliseconds.
 */
export function useDebouncedEffect(
  ms: number,
  effect: React.EffectCallback,
  deps: React.DependencyList
) {
  useEffect(() => {
    const timeout = setTimeout(effect, ms);

    return () => clearTimeout(timeout);
  }, [...deps, ms]);
}
