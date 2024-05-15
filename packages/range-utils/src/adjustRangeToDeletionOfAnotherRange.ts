import splitRangeIntoTwoPartsIfItIsCircular from "./splitRangeIntoTwoPartsIfItIsCircular";
import trimRangeByAnotherRange from "./trimRangeByAnotherRange";

// Define the types for the function parameters
type Range = {
  start: number;
  end: number;
};

// Define the type for the maxLength parameter
type MaxLength = number;

// Define the return type of the function
type AdjustedRange = Range | null;

// Takes in two potentially circular ranges and returns the first one trimmed by the second one
// Returns null if no range is left after the trimming
export default function adjustRangeToDeletionOfAnotherRange(
  rangeToBeAdjusted: Range,
  anotherRange: Range,
  maxLength: MaxLength
): AdjustedRange {
  const trimmedRange = trimRangeByAnotherRange(
    rangeToBeAdjusted,
    anotherRange,
    maxLength
  );
  if (trimmedRange) {
    const nonCircularDeletionRanges = splitRangeIntoTwoPartsIfItIsCircular(
      anotherRange,
      maxLength
    );
    nonCircularDeletionRanges.forEach(function (nonCircularDeletionRange) {
      const deletionLength =
        nonCircularDeletionRange.end - nonCircularDeletionRange.start + 1;
      if (trimmedRange.start > trimmedRange.end) {
        if (nonCircularDeletionRange.start < trimmedRange.end) {
          trimmedRange.start -= deletionLength;
          trimmedRange.end -= deletionLength;
        } else if (nonCircularDeletionRange.start < trimmedRange.start) {
          trimmedRange.start -= deletionLength;
        } else {
          // do nothing
        }
      } else {
        if (nonCircularDeletionRange.start < trimmedRange.start) {
          trimmedRange.start -= deletionLength;
          trimmedRange.end -= deletionLength;
        } else if (nonCircularDeletionRange.start < trimmedRange.end) {
          trimmedRange.end -= deletionLength;
        } else {
          // do nothing
        }
      }
    });
  }
  return trimmedRange;
}
