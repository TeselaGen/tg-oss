import insertSequenceDataAtPositionOrRange from "./insertSequenceDataAtPositionOrRange";
import { SequenceData, Range } from "./types";

export default function deleteSequenceDataAtRange(
  sequenceData: SequenceData,
  range: Range
): SequenceData {
  return insertSequenceDataAtPositionOrRange(
    { sequence: "" },
    sequenceData,
    range
  );
}
