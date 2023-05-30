
const getOverlapsOfPotentiallyCircularRanges = require('./getOverlapsOfPotentiallyCircularRanges')
const collapseOverlapsGeneratedFromRangeComparisonIfPossible = require('./collapseOverlapsGeneratedFromRangeComparisonIfPossible')
const zeroSubrangeByContainerRange = require('./zeroSubrangeByContainerRange')
const normalizePositionByRangeLength = require('./normalizePositionByRangeLength')

//gets the overlapping sections of two ranges and zeroes them to their first point of intersection!
module.exports = function getZeroedRangeOverlaps (annotation, selection, sequenceLength)  {
  const overlaps = collapseOverlapsGeneratedFromRangeComparisonIfPossible(getOverlapsOfPotentiallyCircularRanges(annotation, selection, sequenceLength), sequenceLength, annotation)
  const zeroedOverlaps = overlaps.map((overlap) => {
    return zeroSubrangeByContainerRange(overlap, {
      start: selection.start,
      end: normalizePositionByRangeLength(selection.start - 1, sequenceLength)
    }, sequenceLength)
  })
  return zeroedOverlaps
}