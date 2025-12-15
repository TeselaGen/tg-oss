import expandOrContractRangeByLength from "./expandOrContractRangeByLength";
import * as chai from "chai";
chai.should();

describe("expandOrContractRangeByLength", function () {
  it("shift start by 1 ", function () {
    const expandedRange = expandOrContractRangeByLength(
      { start: 3, end: 4 },
      1,
      true,
      10
    );
    chai.expect(expandedRange).to.deep.equal({
      start: 2,
      end: 4
    });
  });
  it("shift end by 1 ", function () {
    const expandedRange = expandOrContractRangeByLength(
      { start: 3, end: 4 },
      1,
      false,
      10
    );
    chai.expect(expandedRange).to.deep.equal({
      start: 3,
      end: 5
    });
  });
  it("shift end by 6 ", function () {
    const expandedRange = expandOrContractRangeByLength(
      { start: 3, end: 4 },
      6,
      false,
      10
    );
    chai.expect(expandedRange).to.deep.equal({
      start: 3,
      end: 0
    });
  });

  it("circular range", function () {
    const expandedRange = expandOrContractRangeByLength(
      { start: 6, end: 4 },
      1,
      false,
      10
    );
    chai.expect(expandedRange).to.deep.equal({
      start: 6,
      end: 5
    });
  });
  it("circular range", function () {
    const expandedRange = expandOrContractRangeByLength(
      { start: 6, end: 4 },
      1,
      true,
      10
    );
    chai.expect(expandedRange).to.deep.equal({
      start: 5,
      end: 4
    });
  });
  it("circular range", function () {
    const expandedRange = expandOrContractRangeByLength(
      { start: 6, end: 4 },
      1,
      true,
      10
    );
    chai.expect(expandedRange).to.deep.equal({
      start: 5,
      end: 4
    });
  });

  it("negative shiftBy", function () {
    const expandedRange = expandOrContractRangeByLength(
      { start: 6, end: 4 },
      -1,
      true,
      10
    );
    chai.expect(expandedRange).to.deep.equal({
      start: 7,
      end: 4
    });
  });
  it("negative shiftBy", function () {
    const expandedRange = expandOrContractRangeByLength(
      { start: 6, end: 4 },
      -1,
      false,
      10
    );
    chai.expect(expandedRange).to.deep.equal({
      start: 6,
      end: 3
    });
  });
});
