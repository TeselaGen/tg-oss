//0123456789
//r--------r
//
//0123
//r--r
//  0
// 3 1
//  2

const assert = require("assert");
const getMiddleOfRange = require("./getMiddleOfRange");
describe("getMiddleOfRange", function() {
  it("should return the correct length for ranges that cross the origin", function(done) {
    const midpoint = getMiddleOfRange({ start: 9, end: 0 }, 10);
    console.log(`midpoint:`,midpoint)
    assert(midpoint === 0);
    done();
  });
  it("should return the correct midpoint for ranges that do not cross the origin", function(done) {
    const midpoint = getMiddleOfRange({ start: 4, end: 6 }, 10);
    console.log(`midpoint:`,midpoint)
    assert(midpoint === 5);
    done();
  });
  it("should return the correct midpoint for ranges that overlapSelf", function(done) {
    const midpoint = getMiddleOfRange(
      { start: 4, end: 9, overlapsSelf: true },
      10
    );
    console.log(`midpoint:`,midpoint)
    assert(midpoint === 7);
    done();
  });
  it("should return the correct midpoint for ranges that overlapSelf and origin", function(done) {
    const midpoint = getMiddleOfRange(
      { start: 9, end: 1, overlapsSelf: true },
      10
    );
    console.log(`midpoint:`,midpoint)
    assert(midpoint === 0);
    done();
  });
});
