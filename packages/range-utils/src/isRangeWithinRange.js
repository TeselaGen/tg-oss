//TNR: THIS METHOD ONLY WORKS FOR COMPARING 0-BASED RANGES!!!!!!
let trimRangeByAnotherRange = require("./trimRangeByAnotherRange");
module.exports = function isRangeWithinRange(
  rangeToCheck,
  containingRange,
  maxLength
) {
    
  let ranges = trimRangeByAnotherRange(
    rangeToCheck,
    containingRange,
    maxLength
  );
  if (ranges === null) return false
  return !ranges;
};
