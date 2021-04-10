/**
 * This is fully documented here:
 *
 * https://github.com/jnordberg/gif.js
 *
 * These typings are just for the parts of the API we use, they're
 * not complete at all.
 */
export default class GIF {
  constructor(options: {
    /** number of web workers to spawn */
    workers: number;
    /** url to load worker script from */
    workerScript: string;
    /** pixel sample interval, lower is better */
    quality: number;
    /** repeat count, -1 = no repeat, 0 = forever */
    repeat: number;
  });

  addFrame(
    canvas: HTMLCanvasElement,
    options?: {
      /** frame delay */
      delay: number;
    }
  );

  on(event: "finished", callback: (blob: Blob) => void);

  render();
}
