import { Range } from "./types";

import normalizePositionByRangeLength from "./normalizePositionByRangeLength";
import provideInclusiveOptions from "./provideInclusiveOptions";
import { assign } from "lodash-es";
export default provideInclusiveOptions(modulateRangeBySequenceLength);

function modulateRangeBySequenceLength(range: Range, seqLen: number) {
  return assign(range, {
    start: normalizePositionByRangeLength(range.start, seqLen),
    end: normalizePositionByRangeLength(range.end, seqLen)
  });
}
