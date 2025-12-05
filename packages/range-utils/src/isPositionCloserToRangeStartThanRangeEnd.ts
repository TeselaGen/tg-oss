//function to calculate whether a position is closer to the range start than the range end
import getShortestDistanceBetweenTwoPositions from "./getShortestDistanceBetweenTwoPositions";

import { Range } from "./types";

export default function isPositionCloserToRangeStartThanRangeEnd(
  position: number,
  range: Range,
  maxLength: number
) {
  const distanceFromStart = getShortestDistanceBetweenTwoPositions(
    range.start,
    position,
    maxLength
  );
  const distanceFromEnd = getShortestDistanceBetweenTwoPositions(
    range.end,
    position,
    maxLength
  );
  return distanceFromStart <= distanceFromEnd;
}
