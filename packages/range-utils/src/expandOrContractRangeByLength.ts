import { clone } from "lodash-es";
import { Range } from "./types";
import normalizeRange from "./normalizeRange";

export default function expandOrContractRangeByLength(
  range: Range,
  shiftBy: number,
  shiftStart: boolean,
  sequenceLength: number
) {
  const rangeToReturn = clone(range);
  if (shiftStart) {
    rangeToReturn.start -= shiftBy;
  } else {
    rangeToReturn.end += shiftBy;
  }
  return normalizeRange(rangeToReturn, sequenceLength);
}
