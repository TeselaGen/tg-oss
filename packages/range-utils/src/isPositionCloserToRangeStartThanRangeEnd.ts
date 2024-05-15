import getShortestDistanceBetweenTwoPositions from "./getShortestDistanceBetweenTwoPositions";

// function to calculate whether a position is closer to the range start than the range end

export default function isPositionCloserToRangeStartThanRangeEnd(
  position: number,
  range: { start: number; end: number },
  maxLength: number
): boolean {
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
