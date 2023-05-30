//function to calculate whether a position is closer to the range start than the range end
import getShortestDistanceBetweenTwoPositions from './getShortestDistanceBetweenTwoPositions';

export default function isPositionCloserToRangeStartThanRangeEnd(position, range, maxLength) {
    const distanceFromStart = getShortestDistanceBetweenTwoPositions(range.start, position, maxLength);
    const distanceFromEnd = getShortestDistanceBetweenTwoPositions(range.end, position, maxLength);
    return distanceFromStart <= distanceFromEnd
};
