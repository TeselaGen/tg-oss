import insertSequenceDataAtPositionOrRange from "./insertSequenceDataAtPositionOrRange";

export default function deleteSequenceDataAtRange(sequenceData, range) {
  return insertSequenceDataAtPositionOrRange({}, sequenceData, range);
}
