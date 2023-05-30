var expect = require("chai").expect;
var getOverlapBetweenTwoSequences = require("./getOverlapBetweenTwoSequences.js");
describe("getOverlapBetweenTwoSequences", function() {
  it("should get the range overlap given a seq and a seq to search in", function() {
    expect(getOverlapBetweenTwoSequences("gtt", "agttaa")).to.deep.equal({
      start: 1,
      end: 3
    });
    expect(getOverlapBetweenTwoSequences("gtt", "ttaaag")).to.deep.equal({
      start: 5,
      end: 1
    });
  });
  it("should return null if no overlap is found", function() {
    expect(getOverlapBetweenTwoSequences("gtt", "agattaa")).to.deep.equal(null);
  });
  it("should not care about case sensitivity", function() {
    expect(getOverlapBetweenTwoSequences("gTt", "agttaa")).to.deep.equal({
      start: 1,
      end: 3
    });
  });
});
