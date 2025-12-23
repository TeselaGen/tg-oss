import expandOrContractRangeByLength from "./expandOrContractRangeByLength";
import isRangeWithinRange from "./isRangeWithinRange";
import getOverlapsOfPotentiallyCircularRanges from "./getOverlapsOfPotentiallyCircularRanges";
import translateRange from "./translateRange";
import getRangeLength from "./getRangeLength";

import { Range } from "./types";

export default function flipRelativeRange(
  innerRange: Range,
  outerRange: Range,
  sequenceLength: number
) {
  const isFullyContained = isRangeWithinRange(
    innerRange,
    outerRange,
    sequenceLength
  );
  if (isFullyContained) {
    return flipFullyContainedRange(innerRange, outerRange, sequenceLength);
  } else {
    // flip not fully contained range
    return flipNonFullyContainedRange(innerRange, outerRange, sequenceLength);
  }
}

function flipNonFullyContainedRange(
  innerRange: Range,
  outerRange: Range,
  sequenceLength: number
) {
  const outerFullyContained = isRangeWithinRange(
    outerRange,
    innerRange,
    sequenceLength
  );
  let flippedInnerRange;
  if (outerFullyContained) {
    //special logic
    // flipFullyContainedRange(outerRange, outerRange, sequenceLength)
    const expandBy1 =
      getRangeLength(
        {
          start: innerRange.start,
          end: outerRange.start
        },
        sequenceLength
      ) - 1;
    flippedInnerRange = expandOrContractRangeByLength(
      outerRange,
      expandBy1,
      false,
      sequenceLength
    );

    const expandBy2 =
      getRangeLength(
        {
          end: innerRange.end,
          start: outerRange.end
        },
        sequenceLength
      ) - 1;
    flippedInnerRange = expandOrContractRangeByLength(
      flippedInnerRange,
      expandBy2,
      true,
      sequenceLength
    );
  } else {
    //find overlaps of ranges
    const overlaps = getOverlapsOfPotentiallyCircularRanges(
      innerRange,
      outerRange,
      sequenceLength
    );
    //take first overlap and determine which end of outer range it overlaps
    if (overlaps.length >= 1) {
      const firstOverlap = overlaps[0];
      const overlapExtendsForward = firstOverlap.start !== outerRange.start;
      //flip using fully contained logic
      const flippedTruncatedInner = flipFullyContainedRange(
        firstOverlap,
        outerRange,
        sequenceLength
      );
      //extend in the opposite direction
      const lengthToExtend =
        getRangeLength(innerRange, sequenceLength) -
        getRangeLength(flippedTruncatedInner, sequenceLength);
      flippedInnerRange = expandOrContractRangeByLength(
        flippedTruncatedInner,
        lengthToExtend,
        overlapExtendsForward,
        sequenceLength
      );
    } else {
      throw new Error(
        "This case (relative ranges that do not overlap) is unsupported! "
      );
    }
  }
  return flippedInnerRange;
}

function flipFullyContainedRange(
  innerRange: Range,
  outerRange: Range,
  sequenceLength: number
) {
  //translate both ranges by offset such that outer range start = 0
  const translateBy = -outerRange.start;
  const translatedOuterRange = translateRange(
    outerRange,
    translateBy,
    sequenceLength
  );
  const translatedInnerRange = translateRange(
    innerRange,
    translateBy,
    sequenceLength
  );

  //flip like non origin spanning range
  const translatedFlippedInnerRange = flipNonOriginSpanningContainedRange(
    translatedInnerRange,
    translatedOuterRange,
    sequenceLength
  );

  //translate inner range back by negative offset
  const flippedInnerRange = translateRange(
    translatedFlippedInnerRange,
    -translateBy,
    sequenceLength
  );
  return flippedInnerRange;
}

function flipNonOriginSpanningContainedRange(
  innerRange: Range,
  outerRange: Range,
  sequenceLength: number
) {
  //non origin spanning, fully contained inner
  const offsetFromStart = innerRange.start - outerRange.start;
  const newInnerEnd = outerRange.end - offsetFromStart;
  const innerRangeLength = getRangeLength(innerRange, sequenceLength);

  return {
    end: newInnerEnd,
    start: newInnerEnd - (innerRangeLength - 1)
  };
}

//take 2
