import { Range } from "./types";

import getEachPositionInRangeAsArray from "./getEachPositionInRangeAsArray";

export default function loopEachPositionInRange(
  range: Range,
  rangeMax: number,
  func: (pos: number) => void
) {
  getEachPositionInRangeAsArray(range, rangeMax).map(func);
}
