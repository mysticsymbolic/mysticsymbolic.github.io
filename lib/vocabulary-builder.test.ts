import { convertSvgMarkupToSymbolData } from "./vocabulary-builder";

const CIRCLE = `<path fill="#ffffff" fill-rule="evenodd" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M 360.000 29.751 C 542.791 29.751 690.249 177.209 690.249 360.000 C 690.249 542.791 542.791 690.249 360.000 690.249 C 177.209 690.249 29.751 542.791 29.751 360.000 C 29.751 177.209 177.209 29.751 360.000 29.751 Z"/>`;

describe("convertSvgMarkupToSymbolData()", () => {
  it("works with SVGs that just have a path and no specs", () => {
    expect(
      convertSvgMarkupToSymbolData("blarg.svg", `<svg>${CIRCLE}</svg>`)
    ).toMatchSnapshot();
  });
});
