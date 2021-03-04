import { convertSvgMarkupToSymbolData } from "./vocabulary-builder";

const CIRCLE = `<path fill="#ffffff" fill-rule="evenodd" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M 360.000 29.751 C 542.791 29.751 690.249 177.209 690.249 360.000 C 690.249 542.791 542.791 690.249 360.000 690.249 C 177.209 690.249 29.751 542.791 29.751 360.000 C 29.751 177.209 177.209 29.751 360.000 29.751 Z"/>`;

function arrow(color: string) {
  return `<path fill="${color}" fill-rule="evenodd" stroke="none" d="M 360.000 679.153 C 360.001 679.156 372.114 713.074 372.116 713.077 C 372.114 713.076 360.001 701.805 360.000 701.804 C 359.999 701.805 347.886 713.076 347.884 713.077 C 347.886 713.074 359.999 679.156 360.000 679.153 Z"/>`;
}

function withMockConsoleLog(fn: (mock: jest.Mock) => void) {
  const originalLog = console.log;
  const mockLog = jest.fn();
  console.log = mockLog;
  try {
    fn(mockLog);
  } finally {
    console.log = originalLog;
  }
}

describe("convertSvgMarkupToSymbolData()", () => {
  it("works with SVGs that just have a path and no specs", () => {
    expect(
      convertSvgMarkupToSymbolData("blarg.svg", `<svg>${CIRCLE}</svg>`)
    ).toMatchSnapshot();
  });

  it("processes specs", () => {
    const result = convertSvgMarkupToSymbolData(
      "blarg.svg",
      `<svg>${CIRCLE}<g id="specs">${arrow("#ff0000")}</g></svg>`
    );
    expect(result.specs?.anchor).toHaveLength(1);
    expect(result.specs).toMatchSnapshot();
  });

  it("ignores colors in specs it doesn't understand", () => {
    withMockConsoleLog((mockLog) => {
      const result = convertSvgMarkupToSymbolData(
        "blarg.svg",
        `<svg>${CIRCLE}<g id="specs">${arrow("#f1f1f1")}</g></svg>`
      );
      expect(result.specs).toEqual({});
      expect(mockLog).toHaveBeenCalledWith(
        'Not sure what to do with specs path with fill "#f1f1f1", ignoring it.'
      );
    });
  });
});
