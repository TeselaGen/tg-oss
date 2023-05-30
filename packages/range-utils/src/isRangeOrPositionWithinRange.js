const {isObject, } = require("lodash");
const isRangeWithinRange = require("./isRangeWithinRange");
const isPositionWithinRange = require("./isPositionWithinRange");

module.exports = function isRangeOrPositionWithinRange(
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
