module.exports = function condensePairwiseAlignmentDifferences(
  referenceSeq,
  alignedSeq
) {
  let overviewMinimapTrack = [];
  const referenceSeqSplit = referenceSeq.toLowerCase().split("");
  const alignedSeqSplit = alignedSeq.toLowerCase().split("");
  const seqLength = alignedSeq.length;
  const alignedSeqWithoutLeadingDashes = alignedSeq.replace(/^-+/g, "");
  const alignedSeqWithoutTrailingDashes = alignedSeq.replace(/-+$/g, "");

  const startIndex = seqLength - alignedSeqWithoutLeadingDashes.length;
  const endIndex =
    seqLength - (seqLength - alignedSeqWithoutTrailingDashes.length);
  for (let i = 0; i < referenceSeqSplit.length; i++) {
    if (i < startIndex || i >= endIndex) {
      overviewMinimapTrack.push("W");
    } else if (
      referenceSeqSplit[i] === alignedSeqSplit[i] &&
      referenceSeqSplit[i] !== "-" &&
      alignedSeqSplit[i] !== "-"
    ) {
      // ACTG match
      overviewMinimapTrack.push("G");
    } else if (
      referenceSeqSplit[i] !== alignedSeqSplit[i] &&
      referenceSeqSplit[i] !== "-" &&
      alignedSeqSplit[i] !== "-"
    ) {
      // ACTG mismatch
      overviewMinimapTrack.push("R");
    } else if (alignedSeqSplit[i] === "-") {
      // deletion
      overviewMinimapTrack.push("R");
    } else if (
      referenceSeqSplit[i] === "-" &&
      referenceSeqSplit[i - 1] !== "-" &&
      i !== referenceSeqSplit.length - 1 &&
      referenceSeqSplit[i + 1] === "-"
    ) {
      // insertion (first "-" of a >1 insertion)
      overviewMinimapTrack.push("R");
    } else if (
      referenceSeqSplit[i] === "-" &&
      referenceSeqSplit[i - 1] !== "-" &&
      i !== referenceSeqSplit.length - 1 &&
      referenceSeqSplit[i + 1] !== "-"
    ) {
      // "-" of a one-bp insertion in the middle of the sequence
      overviewMinimapTrack.push("R");
      i++;
    } else if (
      i === referenceSeqSplit.length - 1 &&
      referenceSeqSplit[i] === "-" &&
      referenceSeqSplit[i - 1] === "-"
    ) {
      // final "-" of a >1 insertion at the 3' end of the sequence
      overviewMinimapTrack.splice(-2, 1);
    } else if (
      i === referenceSeqSplit.length - 1 &&
      referenceSeqSplit[i] === "-" &&
      referenceSeqSplit[i - 1] !== "-"
    ) {
      // "-" of a one-bp insertion at the 3' end of the sequence
      overviewMinimapTrack.pop();
      overviewMinimapTrack.push("R");
    } else if (
      referenceSeqSplit[i] === "-" &&
      referenceSeqSplit[i - 1] === "-" &&
      referenceSeqSplit[i + 1] !== "-"
    ) {
      // "-" at the end of an insertion
      i++;
    } else if (
      referenceSeqSplit[i] === "-" &&
      referenceSeqSplit[i - 1] === "-"
    ) {
      // insertion (NOT first "-" of the insertion)
      // do nothing, skip over these "-"
    } else {
      console.error("should not reach this step!");
    }
  }
  return overviewMinimapTrack.join("");
};
