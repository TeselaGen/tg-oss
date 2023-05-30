var assert = require("assert");
var findNearestRangeOfSequenceOverlapToPosition = require("./findNearestRangeOfSequenceOverlapToPosition");
describe("findNearestRangeOfSequenceOverlapToPosition", function() {
  it("should find the nearest overlap range to the given position", function() {
    var range = findNearestRangeOfSequenceOverlapToPosition(
      "gagagtagagatagagtagagatagagatagagagagagccagcagacgacgagcagcctacgtcatcatagagagagaag",
      "atagagagag",
      17
    );
    assert.equal(range.start, 27);
    assert.equal(range.end, 36);
  });
  it("should find the nearest overlap range to the given position at the end of the sequence", function() {
    var range = findNearestRangeOfSequenceOverlapToPosition(
      "gagagtagagatagagtagagatagagatagagagagagccagcagacgacgagcagcctacgtcatcatagagagagaag",
      "atagagagag",
      0
    );
    assert.equal(range.start, 68);
    assert.equal(range.end, 77);
  });
  it("should find the nearest overlap range even when that range overlaps the origin", function() {
    var range = findNearestRangeOfSequenceOverlapToPosition(
      "agagaggagagtagagatagagtagagatagagatagagagagagccagcagacgacgagcagcctacgtcatcatagagagagaagatag",
      "atagagagag",
      0
    );
    assert.equal(range.start, 87);
    assert.equal(range.end, 5);
  });
});
