import { normalizeRange, Range } from "@teselagen/range-utils";
function findNearestRangeOfSequenceOverlapToPosition(
  sequenceToSearch: string,
  overlapSequence: string,
  positionStart = 0,
  isLinear?: boolean
): Range | null {
  if (sequenceToSearch.length < overlapSequence.length) {
    return null;
  }
  const regex = new RegExp(overlapSequence, "ig");
  let result: RegExpExecArray | null;
  let index: number | undefined;
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

  if (index === undefined) {
    return null;
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
