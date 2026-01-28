import expandOrContractCircularRangeToPosition from "./expandOrContractCircularRangeToPosition";
import expandOrContractNonCircularRangeToPosition from "./expandOrContractNonCircularRangeToPosition";

import { Range } from "./types";

export default function expandOrContractRangeToPosition(
  range: Range,
  position: number,
  maxLength: number
) {
  if (range.start > range.end) {
    return expandOrContractCircularRangeToPosition(range, position, maxLength);
  } else {
    return expandOrContractNonCircularRangeToPosition(range, position);
  }
}
