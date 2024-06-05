import { clone } from "lodash-es";
import normalizeRange from "./normalizeRange";

export default function expandOrContractRangeByLength(
  range,
  shiftBy,
  shiftStart,
  sequenceLength
) {
  const rangeToReturn = clone(range);
  if (shiftStart) {
    rangeToReturn.start -= shiftBy;
  } else {
    rangeToReturn.end += shiftBy;
  }
  return normalizeRange(rangeToReturn, sequenceLength);
}
