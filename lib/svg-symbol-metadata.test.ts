import path from "path";
import fs from "fs";
import toml from "toml";
import { validateSvgSymbolMetadata } from "./svg-symbol-metadata";

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
      always_nest: true,
      always_be_nested: true,
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
    expect(() =>
      validateSvgSymbolMetadata({
        blarp: true,
      })
    ).toThrow('Unrecognized SVG symbol metadata property "blarp"');
  });
});
