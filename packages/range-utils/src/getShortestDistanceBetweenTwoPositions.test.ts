import assert from "assert";
import getShortestDistanceBetweenTwoPositions from "./getShortestDistanceBetweenTwoPositions";
describe("getShortestDistanceBetweenTwoPositions", function () {
  it("should return the correct length for positions that cross the origin", function () {
    const length = getShortestDistanceBetweenTwoPositions(9, 0, 10);
    assert(length === 1);
  });
  it("should return the correct length for ranges that do not cross the origin", function () {
    const length = getShortestDistanceBetweenTwoPositions(4, 6, 10);
    assert(length === 2);
  });
});
