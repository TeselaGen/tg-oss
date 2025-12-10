import { Range } from "./types";

//
// ac.throw([ac.posInt, ac.posInt, ac.bool], arguments);
//takes a potentially circular range and returns an array containing the range split on the origin
export default function splitRangeIntoTwoPartsIfItIsCircular(
  range: Range,
  sequenceLength: number
) {
  // ac.throw([ac.range, ac.number], arguments);
  if (sequenceLength !== 0) {
    sequenceLength = sequenceLength || Infinity;
  }
  const ranges = [];
  if (range.start > range.end) {
    //the range is cicular, so we return an array of two ranges
    ranges.push({
      start: 0,
      end: range.end,
      type: "end"
    });
    ranges.push({
      start: range.start,
      end: sequenceLength - 1,
      type: "beginning"
    });
  } else {
    //the range isn't circular, so we just return the range
    ranges.push({
      start: range.start,
      end: range.end,
      type: "beginningAndEnd"
    });
  }
  return ranges;
}
