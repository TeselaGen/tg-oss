import { expect } from "chai";
import getOverlapBetweenTwoSequences from "./getOverlapBetweenTwoSequences.js";
describe("getOverlapBetweenTwoSequences", () => {
  it("should get the range overlap given a seq and a seq to search in", () => {
    expect(getOverlapBetweenTwoSequences("gtt", "agttaa")).to.deep.equal({
      start: 1,
      end: 3
    });
    expect(getOverlapBetweenTwoSequences("gtt", "ttaaag")).to.deep.equal({
      start: 5,
      end: 1
    });
  });
  it("should return null if no overlap is found", () => {
    expect(getOverlapBetweenTwoSequences("gtt", "agattaa")).to.deep.equal(null);
  });
  it("should not care about case sensitivity", () => {
    expect(getOverlapBetweenTwoSequences("gTt", "agttaa")).to.deep.equal({
      start: 1,
      end: 3
    });
  });
});
