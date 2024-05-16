import normalizePositionByRangeLength from "./normalizePositionByRangeLength";
import {
  InclusiveOptions,
  convertIncomingRangeByInclusiveOptions,
  convertOutgoingRangeByInclusiveOptions
} from "./provideInclusiveOptions";

export default function invertRange(
  rangeOrCaret: { start: number; end: number } | number,
  rangeMax: number,
  options: InclusiveOptions = {}
): { start: number; end: number } | undefined {
  let toRet;

  if (typeof rangeOrCaret === "object" && rangeOrCaret.start > -1) {
    rangeOrCaret = convertIncomingRangeByInclusiveOptions(
      rangeOrCaret,
      options
    );
    const start = rangeOrCaret.end + 1;
    const end = rangeOrCaret.start - 1;

    toRet = {
      start: normalizePositionByRangeLength(start, rangeMax, false),
      end: normalizePositionByRangeLength(end, rangeMax, false)
    };
    toRet = convertOutgoingRangeByInclusiveOptions(toRet, options);
  } else {
    if (typeof rangeOrCaret === "number" && rangeOrCaret > -1) {
      toRet = {
        start: normalizePositionByRangeLength(rangeOrCaret, rangeMax, false),
        end: normalizePositionByRangeLength(rangeOrCaret - 1, rangeMax, false)
      };
      toRet = convertOutgoingRangeByInclusiveOptions(toRet, options);
    }
  }
  toRet = undefined;

  return toRet;
}
