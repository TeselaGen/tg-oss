import getAllInsertionsInSeqReads from "./getAllInsertionsInSeqReads.js";

// seqReads should be an array of objects [{name, seq, pos, cigar}, {name, seq, pos, cigar}, ...]
// add gaps in reference sequence where there are insertions
export default function insertGapsIntoRefSeq(refSeq, seqReads) {
  // turn ref seq into an array ["A", "T", "C", "G"...]
  const refSeqWithGaps = refSeq.split("");
  const allInsertionsInSeqReads = getAllInsertionsInSeqReads(seqReads);
  for (let i = 0; i < allInsertionsInSeqReads.length; i++) {
    const bpPosOfInsertion = allInsertionsInSeqReads[i].bpPos;
    const numberOfInsertions = allInsertionsInSeqReads[i].number;
    // adding gaps at the bp pos of insertion
    let insertionGaps = "";
    for (let gapI = 0; gapI < numberOfInsertions; gapI++) {
      insertionGaps += "-";
    }
    refSeqWithGaps.splice(bpPosOfInsertion - 1, 0, insertionGaps);
    for (let posI = i + 1; posI < allInsertionsInSeqReads.length; posI++) {
      allInsertionsInSeqReads[posI].bpPos += 1;
    }
  }
  // refSeqWithGaps is a string "GGGA--GA-C--ACC"
  return refSeqWithGaps.join("");
}

// allInsertionsInSeqReads.forEach(insertion => {
//       // adding gap at the bp pos of insertion
//       refSeqWithGaps.splice(insertion - 1, 0, "-");
//   });
//   for (let i = 0; i < allInsertionsInSeqReads.length; i++) {
//     refSeqWithGaps.splice(allInsertionsInSeqReads[i] - 1, 0, "-");
//     for (let innerI = i + 1; innerI < allInsertionsInSeqReads.length; innerI++){
//       if (refSeqWithGaps[i] - 1 !== "-") {
//         // allInsertionsInSeqReads[innerI] += 1;
//         allInsertionsInSeqReads[i + 1] += 1;
//       }
//     }
//   }
