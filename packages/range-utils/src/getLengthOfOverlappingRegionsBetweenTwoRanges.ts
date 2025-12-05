import getRangeLength from "./getRangeLength";
import getOverlapsOfPotentiallyCircularRanges from "./getOverlapsOfPotentiallyCircularRanges";
import { Range } from "./types";

export default function getLengthOfOverlappingRegionsBetweenTwoRanges(
  rangeA: Range,
  rangeB: Range,
  maxLength: number
) {
  const overlaps = getOverlapsOfPotentiallyCircularRanges(
    rangeA,
    rangeB,
    maxLength
  );
  return overlaps.reduce(function (counter, overlap) {
    return counter + getRangeLength(overlap, maxLength);
  }, 0);
}
