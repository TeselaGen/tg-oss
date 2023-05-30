var assert = require("assert");
var getInsertBetweenVals = require("./getInsertBetweenVals");
describe("getInsertBetweenVals", function() {
  it("should get 1 based insert between position X and position X2 based on either a 0-based caretPosition or a 0-based selectionLayer", function() {
    // 0123
    // atgc
    // 1234
    var insertBetween;
    insertBetween = getInsertBetweenVals(1, {}, 4);
    assert(insertBetween[0] === 1);
    assert(insertBetween[1] === 2);

    insertBetween = getInsertBetweenVals(0, {}, 4);
    assert(insertBetween[0] === 4);
    assert(insertBetween[1] === 1);

    insertBetween = getInsertBetweenVals(-1, { start: 1, end: 1 }, 4);
    assert(insertBetween[0] === 1);
    assert(insertBetween[1] === 3);

    insertBetween = getInsertBetweenVals(-1, { start: 0, end: 1 }, 4);
    assert(insertBetween[0] === 4);
    assert(insertBetween[1] === 3);

    insertBetween = getInsertBetweenVals(-1, { start: 3, end: 1 }, 4);
    assert(insertBetween[0] === 3);
    assert(insertBetween[1] === 3);

    insertBetween = getInsertBetweenVals(-1, { start: 3, end: 2 }, 4);
    assert(insertBetween[0] === 3);
    assert(insertBetween[1] === 4);
  });
});
