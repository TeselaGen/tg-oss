import calculatePercentGC from "./calculatePercentGC";
import assert from "assert";

describe("calculatePercentGC", () => {
  it("should return the percent GC of a given sequence string", () => {
    assert.equal(calculatePercentGC("gact"), 50);
    assert.equal(Math.floor(calculatePercentGC("gac")), 66);
    assert.equal(calculatePercentGC("a"), 0);
    assert.equal(calculatePercentGC(""), 0);
    assert.equal(calculatePercentGC("ggg"), 100);
    assert.equal(calculatePercentGC("GGG"), 100);
    assert.equal(calculatePercentGC("ccc"), 100);
  });
});
