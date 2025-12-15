import isRangeOrPositionWithinRange from "./isRangeOrPositionWithinRange";
import { expect } from "chai";

describe("isRangeOrPositionWithinRange", function () {
  it("should correctly determine whether a position is within a range", function () {
    expect(isRangeOrPositionWithinRange(1, { start: 1, end: 1 })).to.equal(
      false
    );
    expect(isRangeOrPositionWithinRange(0, { start: 1, end: 10 })).to.equal(
      false
    );
    expect(isRangeOrPositionWithinRange(1, { start: 0, end: 10 })).to.equal(
      true
    );
    expect(isRangeOrPositionWithinRange(11, { start: 1, end: 10 })).to.equal(
      false
    );
    expect(isRangeOrPositionWithinRange(0, { start: 0, end: 10 })).to.equal(
      false
    );
    expect(isRangeOrPositionWithinRange(10, { start: 0, end: 10 })).to.equal(
      true
    );
    expect(isRangeOrPositionWithinRange(10, { start: 10, end: 5 })).to.equal(
      false
    );
    expect(isRangeOrPositionWithinRange(11, { start: 10, end: 5 })).to.equal(
      true
    );
    expect(isRangeOrPositionWithinRange(4, { start: 10, end: 5 })).to.equal(
      true
    );
    expect(isRangeOrPositionWithinRange(5, { start: 10, end: 5 })).to.equal(
      true
    );
    expect(isRangeOrPositionWithinRange(6, { start: 10, end: 5 })).to.equal(
      false
    );
  });

  it("should correctly determine whether a position is within a range when includeStartEdge/includeEndEdge is set to true", function () {
    expect(
      isRangeOrPositionWithinRange(1, { start: 1, end: 1 }, 11, true, true)
    ).to.equal(true);
    expect(
      isRangeOrPositionWithinRange(0, { start: 0, end: 10 }, 11, true, true)
    ).to.equal(true);
  });

  it("should work for angle values w/ long decimal places", function () {
    expect(
      isRangeOrPositionWithinRange(
        { start: 5.669848916850995, end: 5.815135586893387 },
        { start: 4.71238898038469, end: 1.5707963267948966 },
        Math.PI * 2 + 1 //need the +1
      )
    ).to.equal(true);
  });
  it("should correctly determine whether a position is within a range", function () {
    expect(
      isRangeOrPositionWithinRange(null, { start: 1, end: 10 }, 100)
    ).to.equal(false);
    expect(
      isRangeOrPositionWithinRange({}, { start: 1, end: 10 }, 100)
    ).to.equal(false);
    expect(
      isRangeOrPositionWithinRange({ start: 5, end: 10 }, undefined, 100)
    ).to.equal(false);
    expect(isRangeOrPositionWithinRange(undefined, undefined, 100)).to.equal(
      false
    );
    expect(
      isRangeOrPositionWithinRange(
        { start: 5, end: 10 },
        { start: 1, end: 10 },
        100
      )
    ).to.equal(true);
    expect(
      isRangeOrPositionWithinRange(
        { start: 5, end: 10 },
        { start: -1, end: 10 },
        100
      )
    ).to.equal(false);
    expect(
      isRangeOrPositionWithinRange(
        { start: 0, end: 10 },
        { start: 0, end: 10 },
        100
      )
    ).to.equal(true);
    expect(
      isRangeOrPositionWithinRange(
        { start: 10, end: 10 },
        { start: 1, end: 10 },
        100
      )
    ).to.equal(true);
    expect(
      isRangeOrPositionWithinRange(
        { start: 11, end: 10 },
        { start: 0, end: 10 },
        100
      )
    ).to.equal(false);
    expect(
      isRangeOrPositionWithinRange(
        { start: 12, end: 16 },
        { start: 0, end: 10 },
        100
      )
    ).to.equal(false);
    expect(
      isRangeOrPositionWithinRange(
        { start: 10, end: 5 },
        { start: 10, end: 5 },
        100
      )
    ).to.equal(true);
    expect(
      isRangeOrPositionWithinRange(
        { start: 10, end: 5 },
        { start: 10, end: 5 },
        100
      )
    ).to.equal(true);
    expect(
      isRangeOrPositionWithinRange(
        { start: 10, end: 5 },
        { start: 10, end: 5 },
        100
      )
    ).to.equal(true);
    expect(
      isRangeOrPositionWithinRange(
        { start: 0, end: 6 },
        { start: 10, end: 5 },
        100
      )
    ).to.equal(false);
    expect(
      isRangeOrPositionWithinRange(
        { start: 10, end: 6 },
        { start: 10, end: 5 },
        100
      )
    ).to.equal(false);
  });
});
