import insertGapsIntoRefSeq from "./insertGapsIntoRefSeq.js";

import {cloneDeep} from "lodash";

// bam.seq: NTGTAAGTCGTGAAAAAANCNNNCATATTNCGGAGGTAAAAATGAAAA...
// bam.pos: 43
// bam.cigar: 36M2D917M3I17M7I2M1I6M5I4M1D6M12I8M
// (note: bam.cigar is null if the sequencing read is unaligned)
// bam.reversed: true (if reversed)

// refSeq should be an object { name, sequence }
// seqReads should be an array of objects [{name, seq, pos, cigar}, {name, seq, pos, cigar}, ...]
// add gaps into sequencing reads before starting bp pos and from own deletions & all seq reads' insertions, minus own insertions
export default function addGapsToSeqReads(refSeq, seqReads) {
  // remove unaligned seq reads for now
  for (let i = 0; i < seqReads.length; i++) {
    if (seqReads[i].cigar === null) {
      seqReads.splice(i, 1);
    }
  }

  const refSeqWithGaps = insertGapsIntoRefSeq(refSeq.sequence, seqReads);
  // first object is reference sequence with gaps, to be followed by seq reads with gaps
  const seqReadsWithGaps = [
    { name: refSeq.name, sequence: refSeqWithGaps.toUpperCase() }
  ];
  seqReads.forEach(seqRead => {
    // get all insertions in seq reads
    const allInsertionsInSeqReads = [];
    seqReads.forEach(seqRead => {
      // split cigar string at S, M, D, or I (soft-clipped, match, deletion, or insertion), e.g. ["5S", "2M", "3I", "39M", "3D"..."9S"]
      const splitSeqRead = seqRead.cigar.match(/([0-9]*[SMDI])/g);
      // adjust seqRead.pos, aka bp pos where the seq read starts aligning to the ref seq, if bps have been soft-clipped from the beginning of the seq read
      let adjustedSeqReadPos = cloneDeep(seqRead.pos);
      if (splitSeqRead[0].slice(-1) === "S") {
        // # in #S at beginning of array, i.e. number of soft-clipped base pairs at beginning of the seq read
        const numOfBeginningSoftClipped = splitSeqRead[0].slice(0, -1);
        adjustedSeqReadPos = seqRead.pos - numOfBeginningSoftClipped;
      }
      for (let componentI = 0; componentI < splitSeqRead.length; componentI++) {
        if (splitSeqRead[componentI].slice(-1) === "I") {
          let bpPosOfInsertion = adjustedSeqReadPos;
          const numberOfInsertions = Number(
            splitSeqRead[componentI].slice(0, -1)
          );
          for (let i = 0; i < componentI; i++) {
            if (splitSeqRead[i].slice(-1) !== "I") {
              const previousComponentNumber = Number(
                splitSeqRead[i].slice(0, -1)
              );
              bpPosOfInsertion += previousComponentNumber;
            }
          }
          const insertionInfo = {
            // keeping bpPos 1-based
            bpPos: bpPosOfInsertion,
            number: numberOfInsertions
          };
          allInsertionsInSeqReads.push(insertionInfo);
        }
      }
    });

    // 1) add gaps before starting bp pos
    const splitSeqReadChunk = seqRead.cigar.match(/([0-9]*[SMDI])/g);
    let adjustedSeqReadPos = cloneDeep(seqRead.pos);
    if (splitSeqReadChunk[0].slice(-1) === "S") {
      // # in #S at beginning of array, i.e. number of soft-clipped base pairs at beginning of the seq read
      const numOfBeginningSoftClipped = splitSeqReadChunk[0].slice(0, -1);
      adjustedSeqReadPos = seqRead.pos - numOfBeginningSoftClipped;
    }
    let eachSeqReadWithGaps = seqRead.seq.split("");
    if (adjustedSeqReadPos > 0) {
      eachSeqReadWithGaps.unshift("-".repeat(adjustedSeqReadPos - 1));
    }
    eachSeqReadWithGaps = eachSeqReadWithGaps.join("").split("");

    // 2) add own deletions to own sequence
    // get own deletions
    const ownDeletions = [];
    for (
      let componentI = 0;
      componentI < splitSeqReadChunk.length;
      componentI++
    ) {
      if (splitSeqReadChunk[componentI].slice(-1) === "D") {
        let bpPosOfDeletion = adjustedSeqReadPos;
        const numberOfDeletions = Number(
          splitSeqReadChunk[componentI].slice(0, -1)
        );
        for (let i = 0; i < componentI; i++) {
          const previousComponentNumber = Number(
            splitSeqReadChunk[i].slice(0, -1)
          );
          bpPosOfDeletion += previousComponentNumber;
        }
        const deletionInfo = {
          // keeping bpPos 1-based
          bpPos: bpPosOfDeletion,
          number: numberOfDeletions
        };
        ownDeletions.push(deletionInfo);
      }
    }
    // sort deletions by ascending bp pos
    const sortedOwnDeletions = ownDeletions.sort((a, b) => {
      return a.bpPos - b.bpPos;
    });
    // add own deletions to own sequence
    for (let ownD = 0; ownD < sortedOwnDeletions.length; ownD++) {
      const bpPosOfDeletion = sortedOwnDeletions[ownD].bpPos;
      const numberOfDeletions = sortedOwnDeletions[ownD].number;
      // adding gaps at the bp pos
      let deletionGaps = "";
      for (let gapD = 0; gapD < numberOfDeletions; gapD++) {
        deletionGaps += "-";
      }
      eachSeqReadWithGaps.splice(bpPosOfDeletion - 1, 0, deletionGaps);
      eachSeqReadWithGaps = eachSeqReadWithGaps.join("").split("");
    }
    eachSeqReadWithGaps = eachSeqReadWithGaps.join("").split("");

    // 3) remove own insertions from own sequence
    // get own insertions
    const ownInsertions = [];
    const ownInsertionsBp = [];
    for (
      let componentI = 0;
      componentI < splitSeqReadChunk.length;
      componentI++
    ) {
      if (splitSeqReadChunk[componentI].slice(-1) === "I") {
        let bpPosOfInsertion = adjustedSeqReadPos;
        const numberOfInsertions = Number(
          splitSeqReadChunk[componentI].slice(0, -1)
        );
        const nucleotides = [];
        for (let i = 0; i < componentI; i++) {
          const previousComponentNumber = Number(
            splitSeqReadChunk[i].slice(0, -1)
          );
          bpPosOfInsertion += previousComponentNumber;
        }
        for (let nucI = 0; nucI < numberOfInsertions; nucI++) {
          nucleotides.push(eachSeqReadWithGaps[bpPosOfInsertion - 1 + nucI]);
        }
        const insertionInfo = {
          // keeping bpPos 1-based
          bpPos: bpPosOfInsertion,
          number: numberOfInsertions
        };
        const insertionInfoBp = {
          // keeping bpPos 1-based
          bpPos: bpPosOfInsertion,
          number: numberOfInsertions,
          nucleotides: nucleotides
        };
        ownInsertions.push(insertionInfo);
        ownInsertionsBp.push(insertionInfoBp);
      }
    }
    const ownInsertionsCompare = JSON.parse(JSON.stringify(ownInsertions));
    // sort own insertions by ascending bp pos
    const sortedOwnInsertions = ownInsertions.sort((a, b) => {
      return a.bpPos - b.bpPos;
    });
    const sortedOwnInsertionsBp = ownInsertionsBp.sort((a, b) => {
      return a.bpPos - b.bpPos;
    });
    // remove own insertions from own sequence
    for (let ownI = 0; ownI < sortedOwnInsertions.length; ownI++) {
      const bpPosOfInsertion = sortedOwnInsertions[ownI].bpPos;
      const numberOfInsertions = sortedOwnInsertions[ownI].number;
      for (let numI = 0; numI < numberOfInsertions; numI++) {
        eachSeqReadWithGaps.splice(bpPosOfInsertion - 1, 1);
      }
      for (let posI = ownI + 1; posI < sortedOwnInsertions.length; posI++) {
        sortedOwnInsertions[posI].bpPos -= numberOfInsertions;
      }
    }

    // 4) add other seq reads' insertions to seq read
    // get other seq reads' insertions (i.e. all insertions minus duplicates minus own insertions)
    let otherInsertions = allInsertionsInSeqReads.sort((a, b) => {
      return a.bpPos - b.bpPos;
    });
    // combine duplicates within all insertions, remove own insertions from all insertions, combine overlap between other insertions & own insertions
    // first, combine duplicates within all insertions
    otherInsertions = otherInsertions.filter(
      (object, index) =>
        index ===
        otherInsertions.findIndex(
          obj => JSON.stringify(obj) === JSON.stringify(object)
        )
    );
    // 'i < otherInsertions.length - 1' because when at the end of the array, there is no 'i + 1' to compare to
    for (let i = 0; i < otherInsertions.length - 1; i++) {
      while (otherInsertions[i].bpPos === otherInsertions[i + 1].bpPos) {
        if (otherInsertions[i].number > otherInsertions[i + 1].number) {
          // remove the one with fewer number of gaps from array
          otherInsertions.splice(i + 1, 1);
        } else if (otherInsertions[i].number < otherInsertions[i + 1].number) {
          otherInsertions.splice(i, 1);
        } else if (
          otherInsertions[i].number === otherInsertions[i + 1].number
        ) {
          otherInsertions.splice(i, 1);
        }
      }
    }
    // then remove own insertions from all insertions
    for (let otherI = 0; otherI < ownInsertionsCompare.length; otherI++) {
      const insertionInfoIndex = otherInsertions.findIndex(
        e => e.bpPos === ownInsertionsCompare[otherI].bpPos
      );
      if (insertionInfoIndex !== -1) {
        if (
          otherInsertions[insertionInfoIndex].number >
          ownInsertionsCompare[otherI].number
        ) {
          otherInsertions[insertionInfoIndex].number =
            otherInsertions[insertionInfoIndex].number -
            ownInsertionsCompare[otherI].number;
        } else if (
          otherInsertions[insertionInfoIndex].number <=
          ownInsertionsCompare[otherI].number
        ) {
          otherInsertions.splice(insertionInfoIndex, 1);
          otherI--;
        }
      }
    }
    // then combine overlap between other insertions & own insertions
    for (let overlapI = 0; overlapI < sortedOwnInsertions.length; overlapI++) {
      const insertionInfoIndex = otherInsertions.findIndex(
        e => e.bpPos === sortedOwnInsertions[overlapI].bpPos
      );
      if (insertionInfoIndex !== -1) {
        if (
          otherInsertions[insertionInfoIndex].number >
          sortedOwnInsertions[overlapI].number
        ) {
          otherInsertions[insertionInfoIndex].number =
            otherInsertions[insertionInfoIndex].number -
            sortedOwnInsertions[overlapI].number;
        } else if (
          otherInsertions[insertionInfoIndex].number <=
          sortedOwnInsertions[overlapI].number
        ) {
          otherInsertions.splice(insertionInfoIndex, 1);
          overlapI--;
        }
      }
    }
    // adjust own insertions according to other seq reads' insertions to be added (i.e. for all other reads' insertions with smaller bp pos, +1 to that own insertion's bp pos)
    const adjustedOwnInsertionsBp = JSON.parse(
      JSON.stringify(sortedOwnInsertionsBp)
    );
    for (let ownI = 0; ownI < adjustedOwnInsertionsBp.length; ownI++) {
      let previousInserts = 0;
      for (let i = 0; i < ownI; i++) {
        previousInserts += adjustedOwnInsertionsBp[i].number - 1;
      }
      adjustedOwnInsertionsBp[ownI].bpPos =
        adjustedOwnInsertionsBp[ownI].bpPos - previousInserts;
      sortedOwnInsertionsBp[ownI].bpPos =
        sortedOwnInsertionsBp[ownI].bpPos - previousInserts;
    }
    for (let otherI = 0; otherI < otherInsertions.length; otherI++) {
      for (let ownI = 0; ownI < adjustedOwnInsertionsBp.length; ownI++) {
        if (
          otherInsertions[otherI].bpPos <= sortedOwnInsertionsBp[ownI].bpPos
        ) {
          adjustedOwnInsertionsBp[ownI].bpPos += 1;
        }
      }
    }
    // add other seq reads' insertions to sequence
    for (
      let otherI = 0;
      otherI < otherInsertions.length &&
      otherInsertions[otherI].bpPos <= eachSeqReadWithGaps.length;
      otherI++
    ) {
      const bpPosOfInsertion = otherInsertions[otherI].bpPos;
      const numberOfInsertions = otherInsertions[otherI].number;
      // adding gaps at the bp pos
      let insertionGaps = "";
      for (let gapI = 0; gapI < numberOfInsertions; gapI++) {
        insertionGaps += "-";
      }
      eachSeqReadWithGaps.splice(bpPosOfInsertion - 1, 0, insertionGaps);
      for (let posI = otherI + 1; posI < otherInsertions.length; posI++) {
        otherInsertions[posI].bpPos += 1;
      }
    }

    // 5) add own insertions to own sequence
    for (let ownI = 0; ownI < adjustedOwnInsertionsBp.length; ownI++) {
      const bpPosOfInsertion = adjustedOwnInsertionsBp[ownI].bpPos;
      const nucleotides = adjustedOwnInsertionsBp[ownI].nucleotides.join("");
      eachSeqReadWithGaps.splice(bpPosOfInsertion - 1, 0, nucleotides);
    }

    // 6) add gaps after seq read for ref seq's length = seq read's length
    eachSeqReadWithGaps = eachSeqReadWithGaps.join("").split("");
    if (eachSeqReadWithGaps.length < refSeqWithGaps.length) {
      eachSeqReadWithGaps.push(
        "-".repeat(refSeqWithGaps.length - eachSeqReadWithGaps.length)
      );
    }

    // eachSeqReadWithGaps is a string "GGGA--GA-C--ACC"
    seqReadsWithGaps.push({
      name: seqRead.name,
      sequence: eachSeqReadWithGaps.join(""),
      reversed: seqRead.reversed,
      cigar: seqRead.cigar
    });
  });

  // 7) add gaps before starting bp pos
  // add gaps based on any seq reads that extend beyond beginning of the ref seq due to soft-clipped reads
  // a) get the lengths of bps that extend beyond the beginning of the ref seq among all seq reads
  const seqReadLengthsBeforeRefSeqStart = [];
  seqReads.forEach(seq => {
    const splitSeqReadChunk = seq.cigar.match(/([0-9]*[SMDI])/g);
    let adjustedSeqReadPos = cloneDeep(seq.pos);
    if (splitSeqReadChunk[0].slice(-1) === "S") {
      // # in #S at beginning of array, i.e. number of soft-clipped base pairs at beginning of the seq read
      const numOfBeginningSoftClipped = splitSeqReadChunk[0].slice(0, -1);
      adjustedSeqReadPos = seq.pos - numOfBeginningSoftClipped;
      // number of gaps to add if soft-clipped reads extend beyond beginning of ref seq
      if (adjustedSeqReadPos < 0) {
        seqReadLengthsBeforeRefSeqStart.push(Math.abs(adjustedSeqReadPos));
      }
    }
    // number of gaps to add if seqRead.pos is negative (not sure if this is possible with bowtie2 outputs)
    // if (seq.pos < 0) {
    //   seqReadLengthsBeforeRefSeqStart.push(Math.abs(seq.pos))
    // }
  });
  // b) add gaps (to both ref seq and seq reads) based on any seq reads that extend beyond beginning of ref seq due to soft-clipped reads
  let longestSeqReadLength = 0;
  for (let i = 1; i < seqReadsWithGaps.length; i++) {
    // turn seq read into an array ["A", "T", "C", "G"...]
    const eachSeqReadWithGaps = seqReadsWithGaps[i].sequence.split("");
    const splitSeqReadChunk = seqReads[i - 1].cigar.match(/([0-9]*[SMDI])/g);
    let adjustedSeqReadPos = cloneDeep(seqReads[i - 1].pos);
    // longest length of bps that extend beyond the beginning of the ref seq among all seq reads
    if (seqReadLengthsBeforeRefSeqStart.length > 0) {
      longestSeqReadLength = Math.max(...seqReadLengthsBeforeRefSeqStart);
    }
    if (splitSeqReadChunk[0].slice(-1) === "S") {
      // # in #S at beginning of array, i.e. number of soft-clipped base pairs at beginning of the seq read
      const numOfBeginningSoftClipped = splitSeqReadChunk[0].slice(0, -1);
      adjustedSeqReadPos = seqReads[i - 1].pos - numOfBeginningSoftClipped;
      if (adjustedSeqReadPos > 0) {
        if (longestSeqReadLength > 0) {
          eachSeqReadWithGaps.unshift("-".repeat(longestSeqReadLength + 1));
        }
        seqReadsWithGaps[i].sequence = eachSeqReadWithGaps.join("");
      } else if (adjustedSeqReadPos < 0) {
        if (longestSeqReadLength > 0) {
          eachSeqReadWithGaps.unshift(
            "-".repeat(longestSeqReadLength - Math.abs(adjustedSeqReadPos))
          );
        }
        seqReadsWithGaps[i].sequence = eachSeqReadWithGaps.join("");
      }
    } else {
      if (longestSeqReadLength > 0) {
        eachSeqReadWithGaps.unshift("-".repeat(longestSeqReadLength + 1));
      }
      seqReadsWithGaps[i].sequence = eachSeqReadWithGaps.join("");
    }
  }

  // add gaps before ref seq based on the longest length of soft-clipped reads that extend beyond beginning of ref seq
  if (longestSeqReadLength > 0) {
    const splitRefSeqWithGaps = seqReadsWithGaps[0].sequence.split("");
    splitRefSeqWithGaps.unshift("-".repeat(longestSeqReadLength + 1));
    seqReadsWithGaps[0].sequence = splitRefSeqWithGaps.join("");
  }

  // 8) check if any seq read is longer than the ref seq, make ref seq & seq reads all the same length
  const lengthsOfLongerSeqReads = [];
  for (let i = 1; i < seqReadsWithGaps.length; i++) {
    const refSeq = seqReadsWithGaps[0];
    if (seqReadsWithGaps[i].sequence.length > refSeq.sequence.length) {
      lengthsOfLongerSeqReads.push(seqReadsWithGaps[i].sequence.length);
    }
  }
  if (lengthsOfLongerSeqReads.length > 0) {
    const longestSeqReadLength = Math.max(...lengthsOfLongerSeqReads);
    for (let i = 0; i < seqReadsWithGaps.length; i++) {
      if (seqReadsWithGaps[i].sequence.length < longestSeqReadLength) {
        seqReadsWithGaps[i].sequence += "-".repeat(
          longestSeqReadLength - seqReadsWithGaps[i].sequence.length
        );
      }
    }
  }
  // if any seq read shorter than ref seq, make ref seq & seq reads all the same length
  for (let i = 1; i < seqReadsWithGaps.length; i++) {
    const refSeq = seqReadsWithGaps[0];
    if (seqReadsWithGaps[i].sequence.length < refSeq.sequence.length) {
      seqReadsWithGaps[i].sequence += "-".repeat(
        refSeq.sequence.length - seqReadsWithGaps[i].sequence.length
      );
    }
  }

  // seqReadsWithGaps is an array of objects containing the ref seq with gaps first and then all seq reads with gaps
  // e.g. [{ name: "ref seq", sequence: "GG---GA--GA-C--A---CC---"}, { name: "r1", sequence: "-----GATTGA-C-----------"}...]
  return seqReadsWithGaps;
};
