//0123456789
//r--------r
//
//0123
//r--r
//  0
// 3 1
//  2

import assert from "assert";

import getMiddleOfRange from "./getMiddleOfRange";
describe("getMiddleOfRange", function () {
  it("should return the correct length for ranges that cross the origin", function () {
    const midpoint = getMiddleOfRange({ start: 9, end: 0 }, 10);
    assert(midpoint === 0);
  });
  it("should return the correct midpoint for ranges that do not cross the origin", function () {
    const midpoint = getMiddleOfRange({ start: 4, end: 6 }, 10);
    assert(midpoint === 5);
  });
  it("should return the correct midpoint for ranges that overlapSelf", function () {
    const midpoint = getMiddleOfRange(
      { start: 4, end: 9, overlapsSelf: true },
      10
    );
    assert(midpoint === 7);
  });
  it("should return the correct midpoint for ranges that overlapSelf and origin", function () {
    const midpoint = getMiddleOfRange(
      { start: 9, end: 1, overlapsSelf: true },
      10
    );
    assert(midpoint === 0);
  });
});
