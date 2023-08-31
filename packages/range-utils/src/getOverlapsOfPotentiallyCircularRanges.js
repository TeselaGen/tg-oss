import { flatMap } from "lodash";
import splitRangeIntoTwoPartsIfItIsCircular from "./splitRangeIntoTwoPartsIfItIsCircular";
import getOverlapOfNonCircularRanges from "./getOverlapOfNonCircularRanges";

//returns an array of the overlaps between two potentially circular ranges
export default function getOverlapsOfPotentiallyCircularRanges(
  rangeA,
  rangeB,
  maxRangeLength,
  joinIfPossible //by default this fn only returns **non-circular** overlaps, if true it will try to join overlaps split on the origin
) {
  const normalizedRangeA = splitRangeIntoTwoPartsIfItIsCircular(
    rangeA,
    maxRangeLength
  );
  const normalizedRangeB = splitRangeIntoTwoPartsIfItIsCircular(
    rangeB,
    maxRangeLength
  );

  let overlaps = [];

  normalizedRangeA.forEach(function (nonCircularRangeA, iA) {
    normalizedRangeB.forEach(function (nonCircularRangeB, iB) {
      const overlap = getOverlapOfNonCircularRanges(
        nonCircularRangeA,
        nonCircularRangeB
      );
      if (overlap) {
        overlaps.push(overlap);
      }
    });
  });
  if (
    joinIfPossible &&
    normalizedRangeA.length === 2 &&
    normalizedRangeB.length === 2 &&
    maxRangeLength
  ) {
    //we have 2 circular ranges that will have gotten split on the origin, so we'll manually mend those pieces back together
    const joinedOverlap = {};
    overlaps = flatMap(overlaps, (o, i) => {
      if (o.start === 0) {
        joinedOverlap.end = o.end;
        return [];
      } else if (o.end === maxRangeLength - 1) {
        joinedOverlap.start = o.start;
        return [];
      }
    });
    overlaps.push(joinedOverlap);
  }
  return overlaps;
}
