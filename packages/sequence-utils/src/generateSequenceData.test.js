const generateSequenceData = require("./generateSequenceData");
const chai = require("chai");

chai.should();
const chaiSubset = require("chai-subset");
const { map } = require("lodash");
chai.use(chaiSubset);

describe("generateSequenceData", function() {
  it("should generate some nice random data", function() {
    generateSequenceData({ sequenceLength: 100 }).sequence.length.should.equal(
      100
    );
  });
  it("numFeatures should work", function() {
    const a = generateSequenceData({
      sequenceLength: 100,
      numFeatures: 100
    });
    map(a.features).length.should.equal(100);
  });
});
