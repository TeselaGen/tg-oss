import { Range } from "./types";

export default function convertAACaretPositionOrRangeToDna(
  rangeOrCaret: Range | number
): Range | number {
  if (typeof rangeOrCaret === "object" && rangeOrCaret !== null) {
    return convertAARangeToDnaRange({
      ...rangeOrCaret,
      locations: rangeOrCaret.locations
        ? rangeOrCaret.locations.map(convertAARangeToDnaRange)
        : undefined
    });
  } else {
    return convertAACaretPositionToDnaCaretPosition(rangeOrCaret as number);
  }
}

function convertAACaretPositionToDnaCaretPosition(caret: number): number {
  return caret * 3;
}

function convertAARangeToDnaRange(range: Range): Range {
  return {
    ...range,
    start: range.start > -1 ? range.start * 3 : range.start,
    end: range.end > -1 ? range.end * 3 + 2 : range.end
  };
}
