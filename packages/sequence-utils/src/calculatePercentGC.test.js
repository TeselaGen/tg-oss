var calculatePercentGC = require("./calculatePercentGC");
var assert = require("assert");

describe("calculatePercentGC", function() {
  it("should return the percent GC of a given sequence string", function() {
    assert.equal(calculatePercentGC("gact"), 50);
    assert.equal(Math.floor(calculatePercentGC("gac")), 66);
    assert.equal(calculatePercentGC("a"), 0);
    assert.equal(calculatePercentGC(""), 0);
    assert.equal(calculatePercentGC("ggg"), 100);
    assert.equal(calculatePercentGC("GGG"), 100);
    assert.equal(calculatePercentGC("ccc"), 100);
  });
});
