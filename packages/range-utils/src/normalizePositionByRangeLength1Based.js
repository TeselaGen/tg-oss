import modulatePositionByRange from "./modulatePositionByRange";

export default function normalizePositionByRangeLength1Based(
  position,
  sequenceLength
) {
  return modulatePositionByRange(position, { start: 1, end: sequenceLength });
}
