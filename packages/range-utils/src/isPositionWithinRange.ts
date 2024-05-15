import splitRangeIntoTwoPartsIfItIsCircular from "./splitRangeIntoTwoPartsIfItIsCircular";

/**
 *
 * @param position - assumed to be a 0 based "caretPosition"
 * @param range - 0 based inclusive range
 * @param sequenceLength
 * @param includeStartEdge - (default false) whether or not to include the start edge
 * @param includeEndEdge - (default false) whether or not to include the end edge
 * @returns whether the position is within the range
 */
function isPositionWithinRange(
  position: number,
  range: { start: number; end: number },
  sequenceLength: number,
  includeStartEdge = false,
  includeEndEdge = false
): boolean {
  const ranges = splitRangeIntoTwoPartsIfItIsCircular(range, sequenceLength);
  const positionFits = ranges.some(function (range: {
    start: number;
    end: number;
  }) {
    if (includeStartEdge ? position < range.start : position <= range.start) {
      return false;
    } else {
      if (includeEndEdge ? position <= range.end + 1 : position <= range.end) {
        return true;
      } else {
        return false;
      }
    }
  });
  return positionFits;
}

export default isPositionWithinRange;
