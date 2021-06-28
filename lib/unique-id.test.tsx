import { UniqueIdMap } from "./unique-id";

describe("UniqueIdMap", () => {
  describe("rewriteUrl()", () => {
    it("rewrites a url reference if possible", () => {
      const u = new UniqueIdMap([["foo", "bar"]]);
      expect(u.rewriteUrl("url(#foo)")).toEqual("url(#bar)");
    });

    it("returns the value unmodified if it's not a url reference", () => {
      const u = new UniqueIdMap([["foo", "bar"]]);
      expect(u.rewriteUrl("foo")).toEqual("foo");
    });

    it("raises error when a value isn't found", () => {
      const u = new UniqueIdMap([["foo", "bar"]]);
      expect(() => u.rewriteUrl("url(#blop)")).toThrowError(
        'Unable to find a unique ID for "blop"'
      );
    });
  });

  describe("getStrict()", () => {
    it("returns a value when found", () => {
      const u = new UniqueIdMap([["foo", "bar"]]);
      expect(u.getStrict("foo")).toEqual("bar");
    });

    it("raises error when a value isn't found", () => {
      const u = new UniqueIdMap([["foo", "bar"]]);
      expect(() => u.getStrict("blop")).toThrowError(
        'Unable to find a unique ID for "blop"'
      );
    });
  });
});
