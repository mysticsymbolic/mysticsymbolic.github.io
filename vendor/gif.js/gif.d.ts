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
    workers: number;
    workerScript: string;
    quality: number;
  });

  addFrame(canvas: HTMLCanvasElement);

  on(event: "finished", callback: (blob: Blob) => void);

  render();
}
