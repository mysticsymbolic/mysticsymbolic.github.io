import avro from "avsc";

export class AvroInferredSchema<T extends object> {
  readonly type: avro.Type;

  constructor(readonly defaultValue: T) {
    this.type = avro.Type.forValue(defaultValue);
  }

  fromBuffer(buffer: Buffer): T {
    return this.type.fromBuffer(buffer);
  }

  toBuffer(value: T): Buffer {
    return this.type.toBuffer(value);
  }
}
