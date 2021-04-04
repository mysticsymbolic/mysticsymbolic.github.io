import { useEffect, useState } from "react";

/**
 * A React hook that can be used for animation.
 *
 * Given a duration in milliseconds, returns the percentage through
 * that duration that has passed as a floating-point number
 * from 0.0 to 1.0.
 *
 * Changes in the returned value will be triggered by `requestAnimationFrame`,
 * so they will likely be tied to the monitor's refresh rate.
 *
 * Assumes that the animation is looping, so the percentage will
 * reset to zero once it has finished.
 */
export function useAnimationPct(durationMs: number): number {
  const [pct, setPct] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (!durationMs) {
      setPct(0);
      setLastTimestamp(undefined);
      return;
    }

    const callback = (timestamp: number) => {
      if (typeof lastTimestamp === "number") {
        const timeDelta = timestamp - lastTimestamp;
        const pctDelta = timeDelta / durationMs;
        setPct((pct + pctDelta) % 1.0);
      }
      setLastTimestamp(timestamp);
    };
    const timeout = requestAnimationFrame(callback);

    return () => {
      cancelAnimationFrame(timeout);
    };
  }, [durationMs, pct, lastTimestamp]);

  return pct;
}
