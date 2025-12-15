import getRangeLength from "./getRangeLength";
import { Range } from "./types";

export default function doesRangeSpanEntireSequence(
  range: Range,
  sequenceLength: number
) {
  if (getRangeLength(range, sequenceLength) === sequenceLength) {
    return true;
  }
  return false;
}
