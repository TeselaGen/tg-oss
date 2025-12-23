//
//
import checkIfNonCircularRangesOverlap from "./checkIfNonCircularRangesOverlap";

import splitRangeIntoTwoPartsIfItIsCircular from "./splitRangeIntoTwoPartsIfItIsCircular";
import { Range } from "./types";

export default function checkIfPotentiallyCircularRangesOverlap(
  range: Range,
  comparisonRange: Range
) {
  //split the potentially circular ranges and compare each part for overlap
  return splitRangeIntoTwoPartsIfItIsCircular(range, Infinity).some(
    function (splitRange) {
      return splitRangeIntoTwoPartsIfItIsCircular(
        comparisonRange,
        Infinity
      ).some(function (splitComparisonRange) {
        return checkIfNonCircularRangesOverlap(
          splitRange,
          splitComparisonRange
        );
      });
    }
  );
}
