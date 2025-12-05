import { isObject } from "lodash-es";
import isRangeWithinRange from "./isRangeWithinRange";
import isPositionWithinRange from "./isPositionWithinRange";

import { Range } from "./types";

export default function isRangeOrPositionWithinRange(
  rangeOrPositionToCheck: Range | number,
  containingRange: Range,
  maxLength: number,
  includeStartEdge?: boolean,
  includeEndEdge?: boolean
) {
  if (
    rangeOrPositionToCheck === undefined ||
    rangeOrPositionToCheck === null ||
    containingRange === undefined ||
    containingRange === null
  ) {
    return false;
  }
  if (isObject(rangeOrPositionToCheck)) {
    if (typeof (rangeOrPositionToCheck as Range).start !== "number") {
      return false;
    }
    return isRangeWithinRange(
      rangeOrPositionToCheck as Range,
      containingRange,
      maxLength
    );
  } else {
    return isPositionWithinRange(
      rangeOrPositionToCheck,
      containingRange,
      maxLength,
      includeStartEdge,
      includeEndEdge
    );
  }
}
