//TNR: THIS METHOD ONLY WORKS FOR COMPARING 0-BASED RANGES!!!!!!
import trimRangeByAnotherRange from "./trimRangeByAnotherRange";

export default function isRangeWithinRange(
  rangeToCheck,
  containingRange,
  maxLength
) {
    
  const ranges = trimRangeByAnotherRange(
    rangeToCheck,
    containingRange,
    maxLength
  );
  if (ranges === null) return false
  return !ranges;
};
