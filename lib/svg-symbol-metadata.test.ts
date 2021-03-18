import path from "path";
import fs from "fs";
import toml from "toml";
import {
  validateAttachTo,
  validateSvgSymbolMetadata,
} from "./svg-symbol-metadata";
import { withMockConsoleLog } from "./test-util";

const templatePath = path.join(__dirname, "..", "svg", "_template.toml");

test("metadata template is valid SVG symbol metadata", () => {
  validateSvgSymbolMetadata(
    toml.parse(
      fs.readFileSync(templatePath, {
        encoding: "utf-8",
      })
    )
  );
});

describe("validateSvgSymbolMetadata()", () => {
  it("works with valid metadata", () => {
    expect(
      validateSvgSymbolMetadata({
        always_nest: true,
        always_be_nested: true,
      })
    ).toEqual({
      metadata: {
        always_nest: true,
        always_be_nested: true,
      },
      unknownProperties: [],
    });
  });

  it("raises errors when a property is of the wrong type", () => {
    expect(() =>
      validateSvgSymbolMetadata({
        always_nest: "true",
      })
    ).toThrow('Expected "always_nest" to be a boolean, but it is a string!');
  });

  it("raises errors when a property is unrecognized", () => {
    expect(
      validateSvgSymbolMetadata({
        always_nest: true,
        blarp: true,
      })
    ).toEqual({
      metadata: { always_nest: true },
      unknownProperties: ["blarp"],
    });
  });
});

describe("validateAttachTo()", () => {
  it("works", () => {
    expect(validateAttachTo(["tail", "leg"])).toEqual(["tail", "leg"]);
  });

  it("works", () => {
    withMockConsoleLog((mockLog) => {
      expect(validateAttachTo(["beanbag"])).toEqual([]);
      expect(mockLog).toHaveBeenCalledWith(
        "Item 'beanbag' in \"attach_to\" is not a valid attachment point."
      );
    });
  });

  it("raises error when value is not an array", () => {
    expect(() => validateAttachTo("blah")).toThrow(
      'Expected "attach_to" to be an array, but it is a string!'
    );
  });
});
