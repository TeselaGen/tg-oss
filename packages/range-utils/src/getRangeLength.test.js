//0123456789
//r--------r
//
//0123
//r--r
//  0
// 3 1
//  2

const assert = require("assert");
const getRangeLength = require("./getRangeLength");
describe("getRangeLength", function() {
  it("should return the correct length for ranges that cross the origin", function(done) {
    const length = getRangeLength({ start: 9, end: 0 }, 10);
    assert(length === 2);
    done();
  });
  it("should return the correct length for ranges that do not cross the origin", function(done) {
    const length = getRangeLength({ start: 4, end: 6 }, 10);
    assert(length === 3);
    done();
  });
  it("should return the correct length for ranges that overlapSelf", function(done) {
    const length = getRangeLength({ start: 4, end: 6, overlapsSelf: true }, 10);
    assert(length === 13);
    done();
  });
  it("should return the correct length for ranges that overlapSelf and origin", function(done) {
    const length = getRangeLength({ start: 9, end: 1, overlapsSelf: true }, 10);
    assert(length === 13);
    done();
  });
});
