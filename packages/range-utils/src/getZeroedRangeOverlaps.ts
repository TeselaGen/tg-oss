import { Range } from "./types";
import getOverlapsOfPotentiallyCircularRanges from "./getOverlapsOfPotentiallyCircularRanges";
import collapseOverlapsGeneratedFromRangeComparisonIfPossible from "./collapseOverlapsGeneratedFromRangeComparisonIfPossible";
import zeroSubrangeByContainerRange from "./zeroSubrangeByContainerRange";
import normalizePositionByRangeLength from "./normalizePositionByRangeLength";

//gets the overlapping sections of two ranges and zeroes them to their first point of intersection!
export default function getZeroedRangeOverlaps(
  annotation: Range,
  selection: Range,
  sequenceLength: number
) {
  const overlaps = collapseOverlapsGeneratedFromRangeComparisonIfPossible(
    getOverlapsOfPotentiallyCircularRanges(
      annotation,
      selection,
      sequenceLength
    ),
    sequenceLength,
    annotation
  );
  const zeroedOverlaps = overlaps.map(overlap => {
    return zeroSubrangeByContainerRange(
      overlap,
      {
        start: selection.start,
        end: normalizePositionByRangeLength(selection.start - 1, sequenceLength)
      },
      sequenceLength
    );
  });
  return zeroedOverlaps;
}
