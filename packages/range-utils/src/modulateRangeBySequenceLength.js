import normalizePositionByRangeLength from "./normalizePositionByRangeLength";
import provideInclusiveOptions from "./provideInclusiveOptions";
import { assign } from "lodash";
export default provideInclusiveOptions(modulateRangeBySequenceLength);

function modulateRangeBySequenceLength(range, seqLen) {
  return assign(range, {
    start: normalizePositionByRangeLength(range.start, seqLen),
    end: normalizePositionByRangeLength(range.end, seqLen)
  });
}
