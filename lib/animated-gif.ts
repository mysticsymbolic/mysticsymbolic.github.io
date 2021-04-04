import GIF from "../vendor/gif.js/gif";
import { GIF_WORKER_JS } from "../vendor/gif.js/gif.worker";

export function createGIF(): GIF {
  const workerBlob = new Blob([GIF_WORKER_JS], {
    type: "application/javascript",
  });
  return new GIF({
    workers: 2,
    workerScript: URL.createObjectURL(workerBlob),
    quality: 10,
  });
}
