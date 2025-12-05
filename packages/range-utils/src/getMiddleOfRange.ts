import getRangeLength from "./getRangeLength";
import normalizePositionByRangeLength from "./normalizePositionByRangeLength";
import { Range } from "./types";

export default function getMiddleOfRange(range: Range, rangeMax: number) {
  const len = getRangeLength({ start: range.start, end: range.end }, rangeMax);
  return normalizePositionByRangeLength(
    range.start + Math.floor(len / 2),
    rangeMax
  );
}
