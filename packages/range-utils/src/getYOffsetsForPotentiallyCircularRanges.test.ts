import { expect } from "chai";
import getYOffsetsForPotentiallyCircularRanges from "./getYOffsetsForPotentiallyCircularRanges.js";
describe("getYOffsetsForPotentiallyCircularRanges", function () {
  it("returns correct yOffset for overlapping ranges", function () {
    const ranges = [
      { start: 0, end: 10, id: "1" },
      { start: 5, end: 20, id: "2" },
      { start: 15, end: 25, id: "3" }
    ];
    getYOffsetsForPotentiallyCircularRanges(ranges, false);
    expect(ranges).to.deep.equal([
      { start: 0, end: 10, id: "1", yOffset: 0 },
      { start: 5, end: 20, id: "2", yOffset: 1 },
      { start: 15, end: 25, id: "3", yOffset: 0 }
    ]);
  });
});
