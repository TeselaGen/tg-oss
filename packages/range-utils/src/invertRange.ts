import { Range } from "./types";

import normalizePositionByRangeLength from "./normalizePositionByRangeLength";
import provideInclusiveOptions from "./provideInclusiveOptions";
export default provideInclusiveOptions(invertRange);

function invertRange(
  rangeOrCaret: Range | number,
  rangeMax: number
): Range | undefined {
  if (typeof rangeOrCaret !== "number" && rangeOrCaret.start > -1) {
    const start = rangeOrCaret.end + 1;
    const end = rangeOrCaret.start - 1;
    return {
      start: normalizePositionByRangeLength(start, rangeMax, false),
      end: normalizePositionByRangeLength(end, rangeMax, false)
    };
  } else if (typeof rangeOrCaret === "number" && rangeOrCaret > -1) {
    return {
      start: normalizePositionByRangeLength(rangeOrCaret, rangeMax, false),
      end: normalizePositionByRangeLength(rangeOrCaret - 1, rangeMax, false)
    };
  }
  return undefined;
}
