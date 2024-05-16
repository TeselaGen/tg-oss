import { Range } from "./range-utils-types";
import {
  InclusiveOptions,
  convertIncomingRangeByInclusiveOptions
} from "./provideInclusiveOptions";

export default function getRangeLength(
  range: Range,
  rangeMax?: number,
  options?: InclusiveOptions
): number {
  let toRet: number;
  range = convertIncomingRangeByInclusiveOptions(range, options);
  if (range.end < range.start) {
    toRet = (rangeMax ?? 0) - range.start + range.end + 1;
  } else {
    toRet = range.end - range.start + 1;
  }
  if (range.overlapsSelf && rangeMax) {
    toRet += rangeMax;
  }

  return toRet;
}
