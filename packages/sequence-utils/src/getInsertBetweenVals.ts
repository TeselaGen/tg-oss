import {
  normalizePositionByRangeLength1Based,
  Range
} from "@teselagen/range-utils";

export default function getInsertBetweenVals(
  caretPosition: number,
  selectionLayer: Range,
  sequenceLength: number
): [number, number] {
  if (selectionLayer.start > -1) {
    //selection layer
    return [
      normalizePositionByRangeLength1Based(
        selectionLayer.start,
        sequenceLength
      ),
      normalizePositionByRangeLength1Based(
        selectionLayer.end + 2,
        sequenceLength
      )
    ];
  } else if (caretPosition > -1) {
    return [
      normalizePositionByRangeLength1Based(caretPosition, sequenceLength),
      normalizePositionByRangeLength1Based(caretPosition + 1, sequenceLength)
    ];
  } else {
    return [sequenceLength, 1];
  }
}
