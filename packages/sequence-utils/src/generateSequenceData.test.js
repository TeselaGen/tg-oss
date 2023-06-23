import generateSequenceData from "./generateSequenceData";
import chai from "chai";
import chaiSubset from "chai-subset";
import {map} from "lodash";

chai.should();
chai.use(chaiSubset);

describe("generateSequenceData", () => {
  it("should generate some nice random data", () => {
    generateSequenceData({ sequenceLength: 100 }).sequence.length.should.equal(
      100
    );
  });
  it("numFeatures should work", () => {
    const a = generateSequenceData({
      sequenceLength: 100,
      numFeatures: 100
    });
    map(a.features).length.should.equal(100);
  });
});
