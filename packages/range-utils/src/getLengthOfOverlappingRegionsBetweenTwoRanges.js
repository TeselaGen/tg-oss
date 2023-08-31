import getRangeLength from "./getRangeLength";
import getOverlapsOfPotentiallyCircularRanges from "./getOverlapsOfPotentiallyCircularRanges";

export default function getLengthOfOverlappingRegionsBetweenTwoRanges(
  rangeA,
  rangeB,
  maxLength
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
