//
import checkIfNonCircularRangesOverlap from "./checkIfNonCircularRangesOverlap";

import splitRangeIntoTwoPartsIfItIsCircular from "./splitRangeIntoTwoPartsIfItIsCircular";
// ac.throw([ac.posInt, ac.posInt, ac.bool], arguments);

export default function checkIfPotentiallyCircularRangesOverlap(
  range,
  comparisonRange
) {
  // ac.throw([ac.range, ac.range], arguments);
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
