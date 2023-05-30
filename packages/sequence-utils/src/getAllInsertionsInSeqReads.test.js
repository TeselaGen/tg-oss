const getAllInsertionsInSeqReads = require("./getAllInsertionsInSeqReads.js");

describe("get bp pos of all insertions in seq reads after bowtie2 alignment", function() {
  it("allInsertionsInSeqReads should be an array of objects [{bpPos: bp pos of insertion, number: # of insertions}, {bpPos, number}, ...]", function() {
    const seqReads = [
      { name: "r1", seq: "GATTGAC", pos: 3, cigar: "2M2I3M" },
      { name: "r2", seq: "GAGAGAC", pos: 3, cigar: "7M" },
      { name: "r3", seq: "GGGAGATCAC", pos: 1, cigar: "6M1I3M" },
      { name: "r4", seq: "GATTGAC", pos: 3, cigar: "2M2I3M" },
      { name: "r5", seq: "GAGC", pos: 3, cigar: "3M1D1M" },
      { name: "r6", seq: "GAGCTTACC", pos: 3, cigar: "3M1D1M2I3M" },
      { name: "r7", seq: "GGCATTTCC", pos: 2, cigar: "2M3D2M3I2M" },
      { name: "r8", seq: "GGATTGACATT", pos: 1, cigar: "1D3M2I4M2I2D" },
      { name: "r9", seq: "GGTTTGACCTTT", pos: 1, cigar: "2M3I2D1M2D3M3I" }
    ];
    const result = getAllInsertionsInSeqReads(seqReads);
    expect(result).toEqual([
      { bpPos: 3, number: 3 },
      { bpPos: 5, number: 2 },
      { bpPos: 7, number: 1 },
      { bpPos: 8, number: 2 },
      { bpPos: 9, number: 3 },
      { bpPos: 11, number: 3 }
    ]);
  });
});
