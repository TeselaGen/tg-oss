import { Range } from "./types";

import { assign } from "lodash-es";
import normalizePositionByRangeLength from "./normalizePositionByRangeLength";

export default function translateRange(
  rangeToBeAdjusted: Range,
  translateBy: number,
  rangeLength: number
) {
  return assign({}, rangeToBeAdjusted, {
    start: normalizePositionByRangeLength(
      rangeToBeAdjusted.start + translateBy,
      rangeLength
    ),
    end: normalizePositionByRangeLength(
      rangeToBeAdjusted.end + translateBy,
      rangeLength
    )
  });
}
