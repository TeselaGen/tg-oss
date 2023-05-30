const { normalizeRange } = require("@teselagen/range-utils");
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
  var regex = new RegExp(overlapSequence, "ig");
  var result;
  var index;
  var distance = Infinity;
  while (
    (result = regex.exec(sequenceToSearch + (isLinear ? "" : sequenceToSearch)))
  ) {
    if (result.index > sequenceToSearch.length) break;
    var newDistance = Math.abs(result.index - positionStart);
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
module.exports = findNearestRangeOfSequenceOverlapToPosition;
