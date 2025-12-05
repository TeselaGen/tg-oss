/* eslint-disable no-var*/
import flipContainedRange from "./flipContainedRange";

import * as chai from "chai";
chai.should();

describe("flipContainedRange", function () {
  it("non origin spanning, fully contained inner", function () {
    const innerRange = {
      start: 5,
      end: 13
    };
    const outerRange = {
      start: 0,
      end: 20
    };
    const sequenceLength = 40;
    const flippedInnerRange = flipContainedRange(
      innerRange,
      outerRange,
      sequenceLength
    );
    flippedInnerRange.should.deep.equal({
      start: 7,
      end: 15
    });
  });
  it("non origin spanning outer, origin spanning fully contained inner", function () {
    const innerRange = {
      start: 3,
      end: 1
    };
    const outerRange = {
      start: 0,
      end: 3
    };
    const sequenceLength = 4;
    const flippedInnerRange = flipContainedRange(
      innerRange,
      outerRange,
      sequenceLength
    );
    flippedInnerRange.should.deep.equal({
      start: 2,
      end: 0
    });
  });
  it("origin spanning outer, non-origin spanning, fully contained inner", function () {
    const innerRange = {
      start: 1,
      end: 3
    };
    const outerRange = {
      start: 8,
      end: 5
    };
    const sequenceLength = 10;
    const flippedInnerRange = flipContainedRange(
      innerRange,
      outerRange,
      sequenceLength
    );
    flippedInnerRange.should.deep.equal({
      start: 0,
      end: 2
    });
  });
  it("non-origin spanning outer, non-origin spanning, non-fully contained inner", function () {
    const innerRange = {
      start: 1,
      end: 4
    };
    const outerRange = {
      start: 3,
      end: 6
    };
    const sequenceLength = 10;
    const flippedInnerRange = flipContainedRange(
      innerRange,
      outerRange,
      sequenceLength
    );
    flippedInnerRange.should.deep.equal({
      start: 5,
      end: 8
    });
  });
  it("non-origin spanning outer, non-origin spanning, non-fully contained inner", function () {
    const innerRange = {
      start: 4,
      end: 2
    };
    const outerRange = {
      start: 2,
      end: 5
    };
    const sequenceLength = 10;
    const flippedInnerRange = flipContainedRange(
      innerRange,
      outerRange,
      sequenceLength
    );
    flippedInnerRange.should.deep.equal({
      start: 5,
      end: 3
    });
  });

  it("inner fully spans outer, does not wrap origin", function () {
    const innerRange = {
      start: 1,
      end: 7
    };
    const outerRange = {
      start: 2,
      end: 5
    };
    const sequenceLength = 10;
    const flippedInnerRange = flipContainedRange(
      innerRange,
      outerRange,
      sequenceLength
    );
    flippedInnerRange.should.deep.equal({
      start: 0,
      end: 6
    });
  });

  it("inner fully spans outer, does wrap origin", function () {
    const innerRange = {
      start: 4,
      end: 2
    };
    const outerRange = {
      start: 5,
      end: 2
    };
    const sequenceLength = 10;
    const flippedInnerRange = flipContainedRange(
      innerRange,
      outerRange,
      sequenceLength
    );
    flippedInnerRange.should.deep.equal({
      start: 5,
      end: 3
    });
  });
});
