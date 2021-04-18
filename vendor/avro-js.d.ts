declare module "avro-js" {
  export type AvroType<T> = {
    toBuffer(value: T): Uint8Array;
    fromBuffer(value: Uint8Array): T;
  };

  export function parse<T>(schema: any): AvroType<T>;
}
