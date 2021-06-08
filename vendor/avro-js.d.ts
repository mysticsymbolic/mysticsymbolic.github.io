// This is just a subset of the actual API; for full documentation, see:
//
//   https://github.com/apache/avro/blob/master/lang/js/doc/API.md

declare module "avro-js" {
  /**
   * Opaque type that represents an Avro resolver. For more details, see:
   *
   *   https://github.com/apache/avro/blob/master/lang/js/doc/Advanced-usage.md
   */
  export type Resolver = {
    private _type: "resolver";
  };

  export type AvroType<T> = {
    toBuffer(value: T): Buffer;
    fromBuffer(value: Buffer, resolver?: Resolver, noCheck?: boolean): T;
    createResolver(otherType: AvroType<any>): Resolver;
  };

  export function parse<T>(schema: any): AvroType<T>;
}
