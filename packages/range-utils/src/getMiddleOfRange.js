import getRangeLength from "./getRangeLength";
import normalizePositionByRangeLength from "./normalizePositionByRangeLength";

export default function getMiddleOfRange(range, rangeMax) {
  const len = getRangeLength({ start: range.start, end: range.end }, rangeMax);
  return normalizePositionByRangeLength(
    range.start + Math.floor(len / 2),
    rangeMax
  );
};
