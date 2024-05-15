import invertRange from "./invertRange";
import chai from "chai";

chai.should();

describe("invertRange", function () {
  it("should invert a non-circular range", function () {
    const invertedRange = invertRange({ start: 2, end: 2 }, 10);
    invertedRange.start.should.equal(3);
    invertedRange.end.should.equal(1);
  });

  // ... rest of the test cases ...

  it("should handle inverting a caret position", function () {
    const invertedRange = invertRange(1, 10);
    invertedRange.start.should.equal(1);
    invertedRange.end.should.equal(0);
  });

  it("should handle inverting a caret position", function () {
    const invertedRange = invertRange(0, 10);
    invertedRange.start.should.equal(0);
    invertedRange.end.should.equal(9);
  });

  //tnrtodo: maybe one day we'll want to handle the "entire range" case in a special way, but for now we'll just return the original range
  // it('should handle inverting a whole range by setting the start and end to -1', function () {
  // 	var invertedRange = invertRange({start: 4, end:3}, 10);
  // 	invertedRange.start.should.equal(-1)
  // 	invertedRange.end.should.equal(-1)
  // });
});

describe("invertRange should handle options inclusive1BasedEnd or inclusive1BasedStart", function () {
  it("should handle inverting a whole range by returning the original range", function () {
    const options = { inclusive1BasedEnd: true };
    const invertedRange = invertRange({ start: 2, end: 2 }, 10, options);
    invertedRange.start.should.equal(2);
    invertedRange.end.should.equal(2);
  });

  // ... rest of the test cases ...
});
