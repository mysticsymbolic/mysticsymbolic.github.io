import { SlowBuffer } from "buffer";

export function toBase64(buf: Buffer): string {
  return btoa(String.fromCharCode(...buf));
}

export function fromBase64(value: string): Buffer {
  const binaryString = atob(value);
  const buf = new SlowBuffer(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    buf[i] = binaryString.charCodeAt(i);
  }

  return buf;
}
