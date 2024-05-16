import { assign } from "lodash";
import normalizePositionByRangeLength from "./normalizePositionByRangeLength";
import {
  convertIncomingRangeByInclusiveOptions,
  convertOutgoingRangeByInclusiveOptions,
  InclusiveOptions
} from "./provideInclusiveOptions";
import { Range } from "./range-utils-types";

export default function modulateRangeBySequenceLength(
  range: Range,
  seqLen: number,
  options: InclusiveOptions
): Range {
  range = convertIncomingRangeByInclusiveOptions(range, options);
  const toRet = assign(range, {
    start: normalizePositionByRangeLength(range.start, seqLen),
    end: normalizePositionByRangeLength(range.end, seqLen)
  });
  return convertOutgoingRangeByInclusiveOptions(toRet, options);
}
