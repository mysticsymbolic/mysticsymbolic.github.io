import { fromBase64, toBase64 } from "./base64";

test("base64 encode/decode works", () => {
  const buf = toBase64(Buffer.from([1, 2, 3]));

  expect(Array.from(fromBase64(buf))).toEqual([1, 2, 3]);
});
