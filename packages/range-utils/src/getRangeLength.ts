import provideInclusiveOptions from "./provideInclusiveOptions";
import { Range } from "./types";

export default provideInclusiveOptions(getRangeLength);

function getRangeLength(range: Range, rangeMax: number) {
  let toRet;
  if (range.end < range.start) {
    toRet = rangeMax - range.start + range.end + 1;
  } else {
    toRet = range.end - range.start + 1;
  }
  if (range.overlapsSelf && rangeMax) {
    toRet += rangeMax;
  }
  return toRet;
}
