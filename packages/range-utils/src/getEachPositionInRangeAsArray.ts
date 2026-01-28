import normalizePositionByRangeLength from "./normalizePositionByRangeLength";
import getRangeLength from "./getRangeLength";
import { Range } from "./types";

export default function getEachPositionInRangeAsArray(
  range: Range,
  rangeMax: number
) {
  const output: number[] = [];
  const length = getRangeLength(range, rangeMax);
  if (!(length > 0)) {
    return output;
  }
  for (let i = range.start; i < length + range.start; i++) {
    const position = normalizePositionByRangeLength(i, rangeMax);
    output.push(position);
  }
  return output;
}
