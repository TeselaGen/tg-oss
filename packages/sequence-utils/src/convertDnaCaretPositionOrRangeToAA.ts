import { Range } from "./types";

export default function convertDnaCaretPositionOrRangeToAA(
  rangeOrCaret: Range | number
): Range | number {
  if (typeof rangeOrCaret === "object" && rangeOrCaret !== null) {
    return convertDnaRangeToAARange({
      ...rangeOrCaret,
      locations: rangeOrCaret.locations
        ? rangeOrCaret.locations.map(convertDnaRangeToAARange)
        : undefined
    });
  } else {
    return convertDnaCaretPositionToAACaretPosition(rangeOrCaret as number);
  }
}

function convertDnaCaretPositionToAACaretPosition(caret: number): number {
  return Math.floor(caret / 3);
}

function convertDnaRangeToAARange(range: Range): Range {
  return {
    ...range,
    start: range.start > -1 ? Math.floor(range.start / 3) : range.start,
    end: range.end > -1 ? Math.floor(range.end - 2) / 3 : range.end
  };
}
