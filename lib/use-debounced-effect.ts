import { useEffect } from "react";

/**
 * Like useEffect(), but ensures that the effect is only
 * called when the callback hasn't changed for the
 * given number of milliseconds.
 *
 * Note that this means that the callback itself needs
 * to be wrapped in something like `useCallback()`, or
 * else it may never be called!
 */
export function useDebouncedEffect(ms: number, effect: React.EffectCallback) {
  useEffect(() => {
    const timeout = setTimeout(effect, ms);

    return () => clearTimeout(timeout);
  }, [effect, ms]);
}
