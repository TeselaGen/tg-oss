import getOverlapsOfPotentiallyCircularRanges from "./getOverlapsOfPotentiallyCircularRanges";
import splitRangeIntoTwoPartsIfItIsCircular from "./splitRangeIntoTwoPartsIfItIsCircular";
import trimNonCicularRangeByAnotherNonCircularRange from "./trimNonCicularRangeByAnotherNonCircularRange";
import { extend } from "lodash";

/**
 * trims range, but does *not* adjust it
 * returns a new range if there is one, or null, if it is trimmed completely
 * @param  {object} subRange  {start:
 *                                  end:
 *                                  }
 * @param  {object} containerRange {start:
 *                                  end:
 *                                  }
 * @param  {int} sequenceLength
 * @return {object} || null        {start:
 *                                  end:
 *                                  }
 */
export default function trimRangeByAnotherRange(
  rangeToBeTrimmed,
  trimmingRange,
  sequenceLength
) {
  if (!rangeToBeTrimmed || !trimmingRange) {
    console.warn("invalid range input");
    return null; //a null return val means something went wrong with this function
  }
  let position;
  for (position of [
    rangeToBeTrimmed.start,
    rangeToBeTrimmed.end,
    trimmingRange.start,
    trimmingRange.end
  ]) {
    if (position < 0 || (!position && position !== 0)) {
      console.warn("invalid range input");
      return null; //a null return val means something went wrong with this function
    }
  }
  //get the overlaps of the ranges
  const overlaps = getOverlapsOfPotentiallyCircularRanges(
    rangeToBeTrimmed,
    trimmingRange,
    sequenceLength
  );
  //split the range to be trimmed into pieces if necessary
  if (!overlaps.length) {
    //just return the range to be trimmed
    return rangeToBeTrimmed;
  }
  //and trim both pieces by the already calculated overlaps
  const splitRangesToBeTrimmed = splitRangeIntoTwoPartsIfItIsCircular(
    rangeToBeTrimmed,
    sequenceLength
  );
  splitRangesToBeTrimmed.forEach(function (nonCircularRangeToBeTrimmed, index) {
    overlaps.forEach(function (overlap) {
      if (nonCircularRangeToBeTrimmed) {
        nonCircularRangeToBeTrimmed =
          trimNonCicularRangeByAnotherNonCircularRange(
            nonCircularRangeToBeTrimmed,
            overlap
          );
      }
    });
    splitRangesToBeTrimmed[index] = nonCircularRangeToBeTrimmed;
  });
  //filter out any of the split ranges that have been fully deleted!
  const outputSplitRanges = splitRangesToBeTrimmed.filter(
    function (trimmedRange) {
      if (trimmedRange) {
        return true;
      }
      return false;
    }
  );

  let outputTrimmedRange;
  if (outputSplitRanges.length < 0) {
    //do nothing to the output trimmed range
  } else if (outputSplitRanges.length === 1) {
    outputTrimmedRange = outputSplitRanges[0];
  } else if (outputSplitRanges.length === 2) {
    if (outputSplitRanges[0].start < outputSplitRanges[1].start) {
      outputTrimmedRange = {
        start: outputSplitRanges[1].start,
        end: outputSplitRanges[0].end
      };
    } else {
      outputTrimmedRange = {
        start: outputSplitRanges[0].start,
        end: outputSplitRanges[1].end
      };
    }
  }
  if (outputTrimmedRange) {
    return extend({}, rangeToBeTrimmed, {
      start: outputTrimmedRange.start,
      end: outputTrimmedRange.end
    });
  }
}
