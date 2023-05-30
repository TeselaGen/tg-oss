import {isObject} from "lodash";
import isRangeWithinRange from "./isRangeWithinRange";
import isPositionWithinRange from "./isPositionWithinRange";

export default function isRangeOrPositionWithinRange(
  rangeOrPositionToCheck,
  containingRange,
  maxLength,
  includeStartEdge,
  includeEndEdge
) {

  if (rangeOrPositionToCheck === undefined || rangeOrPositionToCheck === null || 
    containingRange === undefined || containingRange === null ) {
    return false
  }
  if (isObject(rangeOrPositionToCheck))    {
    return isRangeWithinRange(rangeOrPositionToCheck,
      containingRange,
      maxLength)
  } else {
    return isPositionWithinRange( rangeOrPositionToCheck,
      containingRange,
      maxLength,
      includeStartEdge,
      includeEndEdge)
  }

};
