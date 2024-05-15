import getOverlapsOfPotentiallyCircularRanges from "./getOverlapsOfPotentiallyCircularRanges";
import splitRangeIntoTwoPartsIfItIsCircular from "./splitRangeIntoTwoPartsIfItIsCircular";
import trimNonCicularRangeByAnotherNonCircularRange from "./trimNonCicularRangeByAnotherNonCircularRange";
import { extend } from "lodash";

/**
 * trims range, but does *not* adjust it
 * returns a new range if there is one, or null, if it is trimmed completely
 * @param  {object} rangeToBeTrimmed  {start: number, end: number}
 * @param  {object} trimmingRange {start: number, end: number}
 * @param  {number} sequenceLength
 * @return {object | null} {start: number, end: number} || null
 */
export default function trimRangeByAnotherRange(
  rangeToBeTrimmed: { start: number; end: number },
  trimmingRange: { start: number; end: number },
  sequenceLength: number
): { start: number; end: number } | null {
  if (!rangeToBeTrimmed || !trimmingRange) {
    console.warn("invalid range input");
    return null;
  }
  let position: number;
  for (position of [
    rangeToBeTrimmed.start,
    rangeToBeTrimmed.end,
    trimmingRange.start,
    trimmingRange.end
  ]) {
    if (position < 0 || (!position && position !== 0)) {
      console.warn("invalid range input");
      return null;
    }
  }
  const overlaps = getOverlapsOfPotentiallyCircularRanges(
    rangeToBeTrimmed,
    trimmingRange,
    sequenceLength
  );
  if (!overlaps.length) {
    return rangeToBeTrimmed;
  }
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
          ) as { start: number; end: number; type: string };
      }
    });
    splitRangesToBeTrimmed[index] = nonCircularRangeToBeTrimmed;
  });
  const outputSplitRanges = splitRangesToBeTrimmed.filter(
    function (trimmedRange) {
      if (trimmedRange) {
        return true;
      }
      return false;
    }
  );

  let outputTrimmedRange: { start: number; end: number } | undefined;
  if (outputSplitRanges.length < 0) {
    // do nothing to the output trimmed range
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
  return null;
}
