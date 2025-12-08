import { normalizeRange } from "@teselagen/range-utils";
function findNearestRangeOfSequenceOverlapToPosition(
  sequenceToSearch,
  overlapSequence,
  positionStart,
  isLinear
) {
  if (!positionStart) positionStart = 0;
  if (sequenceToSearch.length < overlapSequence.length) {
    return null;
  }
  const regex = new RegExp(overlapSequence, "ig");
  let result;
  let index;
  let distance = Infinity;
  while (
    (result = regex.exec(sequenceToSearch + (isLinear ? "" : sequenceToSearch)))
  ) {
    if (result.index > sequenceToSearch.length) break;
    let newDistance = Math.abs(result.index - positionStart);
    newDistance = isLinear
      ? newDistance //if linear, don't check around the origin
      : Math.min(newDistance, Math.abs(newDistance - sequenceToSearch.length));
    if (newDistance > distance) {
      break;
    }
    index = result.index;
    distance = newDistance;
  }
  //index is the closest range start
  return normalizeRange(
    {
      start: index,
      end: index + overlapSequence.length - 1
    },
    sequenceToSearch.length
  );
}
export default findNearestRangeOfSequenceOverlapToPosition;
