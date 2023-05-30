const addGapsToSeqReads = require("./addGapsToSeqReads.js");

describe("cigar strings to gapped alignments", function() {
  it("adds gaps into sequencing reads before starting bp pos and from own deletions & other seq reads' insertions", function() {
    const refSeq = { name: "ref seq", sequence: "GGGAGACACC" };
    const seqReads = [
      { name: "r1", seq: "GATTGAC", pos: 3, cigar: "2M2I3M", reversed: false },
      { name: "r2", seq: "GAGAGAC", pos: 3, cigar: "7M", reversed: false },
      {
        name: "r3",
        seq: "GGGAGATCAC",
        pos: 1,
        cigar: "6M1I3M",
        reversed: false
      },
      { name: "r4", seq: "GATTGAC", pos: 3, cigar: "2M2I3M", reversed: false },
      { name: "r5", seq: "GAGC", pos: 3, cigar: "3M1D1M", reversed: false },
      {
        name: "r6",
        seq: "GAGCTTACC",
        pos: 3,
        cigar: "3M1D1M2I3M",
        reversed: true
      },
      {
        name: "r7",
        seq: "GGCATTTCC",
        pos: 2,
        cigar: "2M3D2M3I2M",
        reversed: true
      },
      {
        name: "r8",
        seq: "GGATTGACATT",
        pos: 1,
        cigar: "1D3M2I4M2I2D",
        reversed: true
      },
      {
        name: "r9",
        seq: "GGTTTGACCTTT",
        pos: 1,
        cigar: "2M3I2D1M2D3M3I",
        reversed: true
      }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "GG---GA--GA-C--A---CC---" },
      // then seq reads
      {
        name: "r1",
        sequence: "-----GATTGA-C-----------",
        cigar: "2M2I3M",
        reversed: false
      },
      {
        name: "r2",
        sequence: "-----GA--GA-G--A---C----",
        cigar: "7M",
        reversed: false
      },
      {
        name: "r3",
        sequence: "GG---GA--GATC--A---C----",
        cigar: "6M1I3M",
        reversed: false
      },
      {
        name: "r4",
        sequence: "-----GATTGA-C-----------",
        cigar: "2M2I3M",
        reversed: false
      },
      {
        name: "r5",
        sequence: "-----GA--G--C-----------",
        cigar: "3M1D1M",
        reversed: false
      },
      {
        name: "r6",
        sequence: "-----GA--G--CTTA---CC---",
        cigar: "3M1D1M2I3M",
        reversed: true
      },
      {
        name: "r7",
        sequence: "-G---G------C--ATTTCC---",
        cigar: "2M3D2M3I2M",
        reversed: true
      },
      {
        name: "r8",
        sequence: "-G---GATTGA-C--A-TT-----",
        cigar: "1D3M2I4M2I2D",
        reversed: true
      },
      {
        name: "r9",
        sequence: "GGTTT----G-----A---CCTTT",
        cigar: "2M3I2D1M2D3M3I",
        reversed: true
      }
    ]);
  });

  it("removes unaligned seq reads (seqRead.pos = 0, seqRead.cigar = null)", function() {
    const refSeq = { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG" };
    const seqReads = [
      {
        name: "r1",
        seq: "GAAGCAAGGGACSSSSS",
        pos: 13,
        cigar: "12M5S",
        reversed: false
      },
      { name: "r2", seq: "ZZZZZ", pos: 0, cigar: null, reversed: false }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG---" },
      // then seq reads
      {
        name: "r1",
        sequence: "------------GAAGCAAGGGACSSSSS",
        cigar: "12M5S",
        reversed: false
      }
    ]);
  });

  it("adjusts bp pos of alignment with the ref seq (seqRead.pos) if there are soft-clipped reads at the beginning of a seq read (#S at start of seqRead.cigar)...seq read aligned near the beginning of the ref seq", function() {
    const refSeq = { name: "ref seq", sequence: "GGGAGACACC" };
    const seqReads = [
      {
        name: "r1",
        seq: "SSGATTGAC",
        pos: 3,
        cigar: "2S2M2I3M",
        reversed: false
      }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "GGGA--GACACC" },
      // then seq reads
      {
        name: "r1",
        sequence: "SSGATTGAC---",
        cigar: "2S2M2I3M",
        reversed: false
      }
    ]);
  });

  it("adjusts bp pos of alignment with the ref seq (seqRead.pos) if there are soft-clipped reads at the beginning of a seq read (#S at start of seqRead.cigar)...seq read aligned near the middle of the ref seq", function() {
    const refSeq = { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG" };
    const seqReads = [
      {
        name: "r1",
        seq: "SSSGAAGCAAG",
        pos: 13,
        cigar: "3S8M",
        reversed: false
      }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG" },
      // then seq reads
      {
        name: "r1",
        sequence: "---------SSSGAAGCAAG------",
        cigar: "3S8M",
        reversed: false
      }
    ]);
  });

  it("adjusts bp pos of alignment with the ref seq (seqRead.pos) if there are soft-clipped reads at the beginning of a seq read (#S at start of seqRead.cigar)...multiple seq reads with #S at the start", function() {
    const refSeq = { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG" };
    const seqReads = [
      {
        name: "r1",
        seq: "SSACTTCGGAACAGGAAG",
        pos: 3,
        cigar: "2S2M2I12M",
        reversed: false
      },
      {
        name: "r2",
        seq: "SSSGAAGCAAG",
        pos: 13,
        cigar: "3S8M",
        reversed: false
      }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "GGAC--CGGAACAGGAAGCAAGGGACAG" },
      // then seq reads
      {
        name: "r1",
        sequence: "SSACTTCGGAACAGGAAG----------",
        cigar: "2S2M2I12M",
        reversed: false
      },
      {
        name: "r2",
        sequence: "-----------SSSGAAGCAAG------",
        cigar: "3S8M",
        reversed: false
      }
    ]);
  });

  it("adjusts bp pos of alignment with the ref seq (seqRead.pos) if there are soft-clipped reads at the beginning of a seq read (#S at start of seqRead.cigar)...soft-clipped reads before the beginning of the ref seq", function() {
    const refSeq = { name: "ref seq", sequence: "GGGAGACACC" };
    const seqReads = [
      {
        name: "r1",
        seq: "SSSGGGATTGAC",
        pos: 1,
        cigar: "3S4M2I3M",
        reversed: false
      }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "---GGGA--GACACC" },
      // then seq reads
      {
        name: "r1",
        sequence: "SSSGGGATTGAC---",
        cigar: "3S4M2I3M",
        reversed: false
      }
    ]);
  });

  it("works with soft-clipped reads at the end of a seq read (#S at end of seqRead.cigar)", function() {
    const refSeq = { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG" };
    const seqReads = [
      {
        name: "r1",
        seq: "GAAGCAAGSSS",
        pos: 13,
        cigar: "12M5S",
        reversed: false
      }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG" },
      // then seq reads
      {
        name: "r1",
        sequence: "------------GAAGCAAGSSS---",
        cigar: "12M5S",
        reversed: false
      }
    ]);
  });

  it("accounts for soft-clipped reads at the end of a seq read (#S at end of seqRead.cigar) that make seqRead.sequence longer than refSeq.sequence, by making ref seq & seq reads all the same/longest length", function() {
    const refSeq = { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG" };
    const seqReads = [
      {
        name: "r1",
        seq: "GAAGCAAGGGACSSSSS",
        pos: 13,
        cigar: "12M5S",
        reversed: false
      },
      { name: "r2", seq: "GCAAG", pos: 16, cigar: "5M", reversed: false }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "GGACCGGAACAGGAAGCAAGGGACAG---" },
      // then seq reads
      {
        name: "r1",
        sequence: "------------GAAGCAAGGGACSSSSS",
        cigar: "12M5S",
        reversed: false
      },
      {
        name: "r2",
        sequence: "---------------GCAAG---------",
        cigar: "5M",
        reversed: false
      }
    ]);
  });

  it("adjusts bp pos of alignment with the ref seq (seqRead.pos) if there are soft-clipped reads at the beginning of a seq read (#S at start of seqRead.cigar)...soft-clipped reads before the beginning of the ref seq", function() {
    const refSeq = { name: "ref seq", sequence: "GGGAGACACC" };
    const seqReads = [
      {
        name: "r1",
        seq: "SSSGGGATTGAC",
        pos: 1,
        cigar: "3S4M2I3M",
        reversed: false
      },
      { name: "r2", seq: "GGAGAC", pos: 2, cigar: "6M", reversed: false },
      {
        name: "r3",
        seq: "SSGGGATTGAC",
        pos: 1,
        cigar: "2S4M2I3M",
        reversed: false
      },
      { name: "r4", seq: "SSCAC", pos: 7, cigar: "2S3M", reversed: false },
      { name: "r5", seq: "SSSSSCAC", pos: 7, cigar: "5S3M", reversed: false }
    ];
    const result = addGapsToSeqReads(refSeq, seqReads);
    expect(result).toEqual([
      // ref seq first
      { name: "ref seq", sequence: "---GGGA--GACACC" },
      // then seq reads
      {
        name: "r1",
        sequence: "SSSGGGATTGAC---",
        cigar: "3S4M2I3M",
        reversed: false
      },
      { name: "r2", sequence: "----GGA--GAC---", cigar: "6M", reversed: false },
      {
        name: "r3",
        sequence: "-SSGGGATTGAC---",
        cigar: "2S4M2I3M",
        reversed: false
      },
      {
        name: "r4",
        sequence: "---------SSCAC-",
        cigar: "2S3M",
        reversed: false
      },
      {
        name: "r5",
        sequence: "----SSS--SSCAC-",
        cigar: "5S3M",
        reversed: false
      }
    ]);
  });
});
