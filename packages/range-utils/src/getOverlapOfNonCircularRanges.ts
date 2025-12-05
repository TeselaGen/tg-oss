import { Range } from "./types";

export default function getOverlapOfNonCircularRanges(
  rangeA: Range,
  rangeB: Range
) {
  if (rangeA.start < rangeB.start) {
    if (rangeA.end < rangeB.start) {
      //no overlap
    } else {
      if (rangeA.end < rangeB.end) {
        return {
          start: rangeB.start,
          end: rangeA.end
        };
      } else {
        return {
          start: rangeB.start,
          end: rangeB.end
        };
      }
    }
  } else {
    if (rangeA.start > rangeB.end) {
      //no overlap
    } else {
      if (rangeA.end < rangeB.end) {
        return {
          start: rangeA.start,
          end: rangeA.end
        };
      } else {
        return {
          start: rangeA.start,
          end: rangeB.end
        };
      }
    }
  }
  return null;
}
