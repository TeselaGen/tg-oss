export default function trimAnnStartEndToFitSeqLength(
  annStartOrEnd: number,
  sequenceLength: number
) {
  return Math.max(
    0,
    Math.min(annStartOrEnd || 0, Math.max(sequenceLength - 1, 0))
  );
}
