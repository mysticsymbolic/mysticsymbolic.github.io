import { useEffect, useRef } from "react";

/**
 * Like useEffect(), but ensures that the effect is only
 * called when the callback hasn't changed for the
 * given number of milliseconds. It also doesn't trigger
 * on initial mount--only when the callback *changes* from
 * its value on initial mount.
 *
 * Note that this means that the callback itself needs
 * to be wrapped in something like `useCallback()`, or
 * else it may never be called!
 */
export function useDebouncedEffect(ms: number, effect: React.EffectCallback) {
  // https://stackoverflow.com/a/53180013/2422398
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) {
      const timeout = setTimeout(effect, ms);

      return () => clearTimeout(timeout);
    } else {
      didMountRef.current = true;
    }
  }, [effect, ms, didMountRef]);
}
