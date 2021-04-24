// This is just a subset of the actual API; for full documentation, see:
//
//   https://github.com/apache/avro/blob/master/lang/js/doc/API.md

declare module "avro-js" {
  export type AvroType<T> = {
    toBuffer(value: T): Uint8Array;
    fromBuffer(value: Uint8Array): T;
  };

  export function parse<T>(schema: any): AvroType<T>;
}
