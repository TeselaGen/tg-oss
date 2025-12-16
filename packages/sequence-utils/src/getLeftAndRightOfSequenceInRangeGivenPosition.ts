import {
  isPositionWithinRange,
  getSequenceWithinRange,
  normalizePositionByRangeLength,
  isPositionCloserToRangeStartThanRangeEnd,
  Range
} from "@teselagen/range-utils";

export default function getLeftAndRightOfSequenceInRangeGivenPosition(
  range: Range,
  position: number,
  sequence: string
): { leftHandSide: string; rightHandSide: string } {
  const result = {
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
    ) as string;
    result.rightHandSide = getSequenceWithinRange(
      { start: position, end: range.end },
      sequence
    ) as string;
  } else {
    if (
      isPositionCloserToRangeStartThanRangeEnd(position, range, sequence.length)
    ) {
      result.rightHandSide = getSequenceWithinRange(range, sequence) as string;
    } else {
      result.leftHandSide = getSequenceWithinRange(range, sequence) as string;
    }
  }
  return result;
}
