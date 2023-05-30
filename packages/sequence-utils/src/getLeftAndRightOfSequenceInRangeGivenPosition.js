const {
  isPositionWithinRange,
  getSequenceWithinRange,
  normalizePositionByRangeLength,
  isPositionCloserToRangeStartThanRangeEnd
} = require("@teselagen/range-utils");

module.exports = function getLeftAndRightOfSequenceInRangeGivenPosition(
  range,
  position,
  sequence
) {
  let result = {
    leftHandSide: "",
    rightHandSide: ""
  };
  if (isPositionWithinRange(position, range)) {
    result.leftHandSide = getSequenceWithinRange(
      {
        start: range.start,
        end: normalizePositionByRangeLength(position - 1, sequence.length)
      },
      sequence
    );
    result.rightHandSide = getSequenceWithinRange(
      { start: position, end: range.end },
      sequence
    );
  } else {
    if (
      isPositionCloserToRangeStartThanRangeEnd(position, range, sequence.length)
    ) {
      result.rightHandSide = getSequenceWithinRange(range, sequence);
    } else {
      result.leftHandSide = getSequenceWithinRange(range, sequence);
    }
  }
  return result;
};
