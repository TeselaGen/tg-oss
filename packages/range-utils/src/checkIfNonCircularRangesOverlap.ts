import { Range } from "./types";

//

export default function checkIfNonCircularRangesOverlap(
  range: Range,
  comparisonRange: Range
) {
  if (range.start < comparisonRange.start) {
    if (range.end < comparisonRange.start) {
      //----llll
      //--------cccc
      //no overlap
      return false;
    } else {
      //----llll
      //-------cccc
      //overlap
      return true;
    }
  } else {
    if (range.start > comparisonRange.end) {
      //------llll
      // -cccc
      //no overlap
      return false;
    } else {
      //-----llll
      // -cccc
      //overlap
      return true;
    }
  }
}
