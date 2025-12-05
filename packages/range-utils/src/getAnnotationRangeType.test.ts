import getAnnotationRangeType from "./getAnnotationRangeType";
import { expect } from "chai";

describe("getAnnotationRangeType", function () {
  it("should get the correct sub range type give a sub range and its enclosing range", function () {
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 4, end: 7 }, true)
    ).to.equal("beginningAndEnd");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 4, end: 7 }, false)
    ).to.equal("beginningAndEnd");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 4, end: 8 }, true)
    ).to.equal("start");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 4, end: 8 }, false)
    ).to.equal("end");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 3, end: 8 }, true)
    ).to.equal("middle");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 3, end: 8 }, false)
    ).to.equal("middle");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 3, end: 1 }, true)
    ).to.equal("middle");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 3, end: 2 }, false)
    ).to.equal("middle");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 4, end: 1 }, true)
    ).to.equal("start");
    expect(
      getAnnotationRangeType({ start: 4, end: 7 }, { start: 9, end: 7 }, false)
    ).to.equal("start");
  });
});
