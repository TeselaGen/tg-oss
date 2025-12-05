//TNR: THIS METHOD ONLY WORKS FOR COMPARING 0-BASED RANGES!!!!!!
import trimRangeByAnotherRange from "./trimRangeByAnotherRange";

import { Range } from "./types";

export default function isRangeWithinRange(
  rangeToCheck: Range,
  containingRange: Range,
  maxLength: number
) {
  const ranges = trimRangeByAnotherRange(
    rangeToCheck,
    containingRange,
    maxLength
  );
  if (ranges === null) return false;
  return !ranges;
}
