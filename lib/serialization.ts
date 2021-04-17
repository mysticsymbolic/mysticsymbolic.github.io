import avro from "avsc";

export class AvroRecordSchema<T> {
  readonly type: avro.Type;
  readonly schema: avro.Schema;

  constructor(name: string, fieldTypes: { [k in keyof T]: avro.Schema }) {
    const schema: avro.Schema = {
      name,
      type: "record",
      fields: [],
    };
    for (let name in fieldTypes) {
      const type = fieldTypes[name];
      schema.fields.push({
        name,
        type,
      });
    }
    this.type = avro.Type.forSchema(schema);
    this.schema = schema;
  }

  fromBuffer(buffer: Buffer): T {
    return this.type.fromBuffer(buffer);
  }

  toBuffer(value: T): Buffer {
    return this.type.toBuffer(value);
  }
}
