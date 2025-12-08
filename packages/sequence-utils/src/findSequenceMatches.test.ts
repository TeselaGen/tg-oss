import findSequenceMatches from "./findSequenceMatches";

describe("findSequenceMatches", () => {
  it("ambiguous protein sequence with asterisk as stop codon", () => {
    expect(
      findSequenceMatches("mmhlrl*", "Mxxlrl*", {
        isAmbiguous: true,
        isProteinSequence: true /* isProteinSearch: true */
      })
    ).toEqual([
      {
        start: 0,
        end: 6
      }
    ]);
    expect(
      findSequenceMatches("mmhlrl*", "mx", {
        isAmbiguous: true,
        isProteinSequence: true /* isProteinSearch: true */
      })
    ).toEqual([
      {
        start: 0,
        end: 1
      },
      {
        start: 1,
        end: 2
      }
    ]);
  });
  it("protein sequence with asterisk as stop codon", () => {
    expect(
      findSequenceMatches("mmhlrl*", "mMh", {
        isProteinSequence: true /* isProteinSearch: true */
      })
    ).toEqual([
      {
        start: 0,
        end: 2
      }
    ]);
    expect(
      findSequenceMatches("mmhlrl*", "Mmhlrl*", {
        isProteinSequence: true /* isProteinSearch: true */
      })
    ).toEqual([
      {
        start: 0,
        end: 6
      }
    ]);
  });
  it("returns an empty array when nothing matches", () => {
    expect([]).toEqual(findSequenceMatches("atg", "xtag"));
  });
  it("handles various weird characters", () => {
    expect([]).toEqual(findSequenceMatches("atg", " . xt ** ag $#@@!"));
  });
  it("returns matches for non-circular, non-ambiguous, dna searches", () => {
    expect([
      {
        start: 1,
        end: 1
      }
    ]).toEqual(findSequenceMatches("atg", "t"));
    expect([
      {
        start: 2,
        end: 3
      },
      {
        start: 3,
        end: 4
      },
      {
        start: 7,
        end: 8
      }
    ]).toEqual(findSequenceMatches("atgggaagg", "gg"));
    //atgggaagg
    //012345678
  });
  it("returns matches for circular, non-ambiguous, dna searches", () => {
    const matches = findSequenceMatches("atg", "ga", { isCircular: true });
    expect(matches).toEqual([
      {
        start: 2,
        end: 0
      }
    ]);
  });
  it("returns matches for circular, non-ambiguous, dna searches on bottom strand that cross origin", () => {
    const matches = findSequenceMatches("atga", "ttc", {
      isCircular: true,
      searchReverseStrand: true
    });
    expect(matches).toEqual([
      {
        bottomStrand: true,
        start: 2,
        end: 0
      }
    ]);
  });
  it("returns matches for a long circular, non-ambiguous, dna searches", () => {
    const matches = findSequenceMatches(
      "gacgtcttatgacaacttgacggctacatcattcactttttcttcacaaccggcacggaactcgctcgggctggccccggtgcattttttaaatacccgcgagaaatagagttgatcgtcaaaaccaacattgcgaccgacggtggcgataggcatccgggtggtgctcaaaagcagcttcgcctggctgatacgttggtcctcgcgccagcttaagacgctaatccctaactgctggcggaaaagatgtgacagacgcgacggcgacaagcaaacatgctgtgcgacgctggcgatatcaaaattgctgtctgccaggtgatcgctgatgtactgacaagcctcgcgtacccgattatccatcggtggatggagcgactcgttaatcgcttccatgcgccgcagtaacaattgctcaagcagatttatcgccagcagctccgaatagcgcccttccccttgcccggcgttaatgatttgcccaaacaggtcgctgaaatgcggctggtgcgcttcatccgggcgaaagaaccccgtattggcaaatattgacggccagttaagccattcatgccagtaggcgcgcggacgaaagtaaacccactggtgataccattcgcgagcctccggatgacgaccgtagtgatgaatctctcctggcgggaacagcaaaatatcacccggtcggcaaacaaattctcgtccctgatttttcaccaccccctgaccgcgaatggtgagattgagaatataacctttcattcccagcggtcggtcgataaaaaaatcgagataaccgttggcctcaatcggcgttaaacccgccaccagatgggcattaaacgagtatcccggcagcaggggatcattttgcgcttcagccatacttttcatactcccgccattcagagaagaaaccaattgtccatattgcatcagacattgccgtcactgcgtcttttactggctcttctcgctaaccaaaccggtaaccccgcttattaaaagcattctgtaacaaagcgggaccaaagccatgacaaaaacgcgtaacaaaagtgtctataatcacggcagaaaagtccacattgattatttgcacggcgtcacactttgctatgccatagcatttttatccataagattagcggattctacctgacgctttttatcgcaactctctactgtttctccatacccgtttttttgggaatttttaagaaggagatatacatatgagtaaaggagaagaacttttcactggagttgtcccaattcttgttgaattagatggtgatgttaatgggcacaaattttctgtcagtggagagggtgaaggtgatgcaacatacggaaaacttacccttaaatttatttgcactactggaaaactacctgttccatggccaacacttgtcactactttctcttatggtgttcaatgcttttcccgttatccggatcatatgaaacggcatgactttttcaagagtgccatgcccgaaggttatgtacaggaacgcactatatctttcaaagatgacgggaactacaagacgcgtgctgaagtcaagtttgaaggtgatacccttgttaatcgtatcgagttaaaaggtattgattttaaagaagatggaaacattctcggacacaaactcgaatacaactataactcacacaatgtatacatcacggcagacaaacaaaagaatggaatcaaagctaacttcaaaattcgccacaacattgaagatggatctgttcaactagcagaccattatcaacaaaatactccaattggcgatggccctgtccttttaccagacaaccattacctgtcgacacaatctgccctttcgaaagatcccaacgaaaagcgtgaccacatggtccttcttgagtttgtaactgctgctgggattacacatggcatggatgagctcggcggcggcggcagcaaggtctacggcaaggaacagtttttgcggatgcgccagagcatgttccccgatcgctaaatcgagtaaggatctccaggcatcaaataaaacgaaaggctcagtcgaaagactgggcctttcgttttatctgttgtttgtcggtgaacgctctctactagagtcacactggctcaccttcgggtgggcctttctgcgtttatacctagggtacgggttttgctgcccgcaaacgggctgttctggtgttgctagtttgttatcagaatcgcagatccggcttcagccggtttgccggctgaaagcgctatttcttccagaattgccatgattttttccccacgggaggcgtcactggctcccgtgttgtcggcagctttgattcgataagcagcatcgcctgtttcaggctgtctatgtgtgactgttgagctgtaacaagttgtctcaggtgttcaatttcatgttctagttgctttgttttactggtttcacctgttctattaggtgttacatgctgttcatctgttacattgtcgatctgttcatggtgaacagctttgaatgcaccaaaaactcgtaaaagctctgatgtatctatcttttttacaccgttttcatctgtgcatatggacagttttccctttgatatgtaacggtgaacagttgttctacttttgtttgttagtcttgatgcttcactgatagatacaagagccataagaacctcagatccttccgtatttagccagtatgttctctagtgtggttcgttgtttttgcgtgagccatgagaacgaaccattgagatcatacttactttgcatgtcactcaaaaattttgcctcaaaactggtgagctgaatttttgcagttaaagcatcgtgtagtgtttttcttagtccgttatgtaggtaggaatctgatgtaatggttgttggtattttgtcaccattcatttttatctggttgttctcaagttcggttacgagatccatttgtctatctagttcaacttggaaaatcaacgtatcagtcgggcggcctcgcttatcaaccaccaatttcatattgctgtaagtgtttaaatctttacttattggtttcaaaacccattggttaagccttttaaactcatggtagttattttcaagcattaacatgaacttaaattcatcaaggctaatctctatatttgccttgtgagttttcttttgtgttagttcttttaataaccactcataaatcctcatagagtatttgttttcaaaagacttaacatgttccagattatattttatgaatttttttaactggaaaagataaggcaatatctcttcactaaaaactaattctaatttttcgcttgagaacttggcatagtttgtccactggaaaatctcaaagcctttaaccaaaggattcctgatttccacagttctcgtcatcagctctctggttgctttagctaatacaccataagcattttccctactgatgttcatcatctgagcgtattggttataagtgaacgataccgtccgttctttccttgtagggttttcaatcgtggggttgagtagtgccacacagcataaaattagcttggtttcatgctccgttaagtcatagcgactaatcgctagttcatttgctttgaaaacaactaattcagacatacatctcaattggtctaggtgattttaatcactataccaattgagatgggctagtcaatgataattactagtccttttcccgggtgatctgggtatctgtaaattctgctagacctttgctggaaaacttgtaaattctgctagaccctctgtaaattccgctagacctttgtgtgttttttttgtttatattcaagtggttataatttatagaataaagaaagaataaaaaaagataaaaagaatagatcccagccctgtgtataactcactactttagtcagttccgcagtattacaaaaggatgtcgcaaacgctgtttgctcctctacaaaacagaccttaaaaccctaaaggcttaagtagcaccctcgcaagctcgggcaaatcgctgaatattccttttgtctccgaccatcaggcacctgagtcgctgtctttttcgtgacattcagttcgctgcgctcacggctctggcagtgaatgggggtaaatggcactacaggcgccttttatggattcatgcaaggaaactacccataatacaagaaaagcccgtcacgggcttctcagggcgttttatggcgggtctgctatgtggtgctatctgactttttgctgttcagcagttcctgccctctgattttccagtctgaccacttcggattatcccgtgacaggtcattcagactggctaatgcacccagtaaggcagcggtatcatcaacaggcttacccgtcttactgtccctagtgcttggattctcaccaataaaaaacgcccggcggcaaccgagcgttctgaacaaatccagatggagttctgaggtcattactggatctatcaacaggagtccaagcgagctcgatatcaaattacgccccgccctgccactcatcgcagtactgttgtaattcattaagcattctgccgacatggaagccatcacaaacggcatgatgaacctgaatcgccagcggcatcagcaccttgtcgccttgcgtataatatttgcccatggtgaaaacgggggcgaagaagttgtccatattggccacgtttaaatcaaaactggtgaaactcacccagggattggctgagacgaaaaacatattctcaataaaccctttagggaaataggccaggttttcaccgtaacacgccacatcttgcgaatatatgtgtagaaactgccggaaatcgtcgtggtattcactccagagcgatgaaaacgtttcagtttgctcatggaaaacggtgtaacaagggtgaacactatcccatatcaccagctcaccgtctttcattgccatacgaaattccggatgagcattcatcaggcgggcaagaatgtgaataaaggccggataaaacttgtgcttatttttctttacggtctttaaaaaggccgtaatatccagctgaacggtctggttataggtacattgagcaactgactgaaatgcctcaaaatgttctttacgatgccattgggatatatcaacggtggtatatccagtgatttttttctccattttagcttccttagctcctgaaaatctcgataactcaaaaaatacgcccggtagtgatcttatttcattatggtgaaagttggaacctcttacgtgccgatcaacgtctcattttcgccagatatc",
      "atgagacg",
      { isCircular: true, searchReverseStrand: true }
    );
    expect(matches).toEqual([
      {
        bottomStrand: true,
        end: 5284,
        start: 5277
      }
    ]);
  });
  it("non-ambiguous, dna searches for nothing results in empty array", () => {
    const matches = findSequenceMatches("atg", "*", {});
    expect(matches).toEqual([]);
  });
  it("ambiguous, protein searches for nothing results in empty array", () => {
    const matches = findSequenceMatches("atg", "*", {
      isProteinSearch: true,
      isAmbiguous: true
    });
    expect(matches).toEqual([]);
  });
  it("ambiguous, dna searches for nothing results in empty array", () => {
    const matches = findSequenceMatches("atg", "*", { isAmbiguous: true });
    expect(matches).toEqual([]);
  });
  it("ambiguous, dna searches with asterisk", () => {
    const matches = findSequenceMatches("atg", "", { isAmbiguous: true });
    expect(matches).toEqual([]);
  });
  it("AA with asterisk as stop codon in atgtaa", () => {
    expect(
      findSequenceMatches("atgtaa", "M*", { isProteinSearch: true })
    ).toEqual([
      {
        start: 0,
        end: 5
      }
    ]);
  });
  it("AA with asterisk as stop codon in atgtaaccc", () => {
    expect(
      findSequenceMatches("atgtaaccc", "M**", { isProteinSearch: true })
    ).toEqual([]);
  });
  it("works with ambiguous AA", () => {
    expect(
      findSequenceMatches("atgatg", "MX", {
        isProteinSearch: true,
        isAmbiguous: true
      })
    ).toEqual([
      {
        start: 0,
        end: 5
      }
    ]);
  });
  it("works with ambiguous AA with asterisk in search string", () => {
    expect(
      findSequenceMatches("atgtaa", "M*", {
        isProteinSearch: true,
        isAmbiguous: true
      })
    ).toEqual([
      {
        start: 0,
        end: 5
      }
    ]);
  });
  it("returns matches for non-circular, non-ambiguous, AA searches", () => {
    expect(findSequenceMatches("atg", "M", { isProteinSearch: true })).toEqual([
      {
        start: 0,
        end: 2
      }
    ]);
    expect(
      findSequenceMatches("TTTATGAGT", "MS", { isProteinSearch: true })
    ).toEqual([
      {
        start: 3,
        end: 8
      }
    ]);
    expect(
      findSequenceMatches("TTATGAGT", "MS", { isProteinSearch: true })
    ).toEqual([
      {
        start: 2,
        end: 7
      }
    ]);
    expect(
      findSequenceMatches("TTTTATGAGT", "MS", { isProteinSearch: true })
    ).toEqual([
      {
        start: 4,
        end: 9
      }
    ]);

    // 0   1   2
    // P   T   R
    // 012 345 678
    // ATG ATG ATG
  });
  it("returns matches for non-circular, ambiguous, dna searches", () => {
    const matches = findSequenceMatches("atg", "m", { isAmbiguous: true });
    expect(matches).toEqual([
      {
        start: 0,
        end: 0
      }
    ]);
    expect(findSequenceMatches("atg", "n", { isAmbiguous: true })).toEqual([
      {
        start: 0,
        end: 0
      },
      {
        start: 1,
        end: 1
      },
      {
        start: 2,
        end: 2
      }
    ]);
    expect(
      findSequenceMatches("atgcctcc", "ccnnc", { isAmbiguous: true })
    ).toEqual([
      {
        start: 3,
        end: 7
      }
    ]);
  });
  it("returns matches for both strands for non-circular, ambiguous, dna searches", () => {
    const matches = findSequenceMatches("atg", "m", {
      isAmbiguous: true,
      searchReverseStrand: true
    });
    expect(matches).toEqual([
      {
        start: 0,
        end: 0
      },
      { bottomStrand: true, end: 2, start: 2 },
      { bottomStrand: true, end: 1, start: 1 }
    ]);
    expect(
      findSequenceMatches("atg", "n", {
        isAmbiguous: true,
        searchReverseStrand: true
      })
    ).toEqual([
      { end: 0, start: 0 },
      { end: 1, start: 1 },
      { end: 2, start: 2 },
      { bottomStrand: true, end: 2, start: 2 },
      { bottomStrand: true, end: 1, start: 1 },
      { bottomStrand: true, end: 0, start: 0 }
    ]);
    expect(
      findSequenceMatches("atgcctcc", "ccnnc", {
        isAmbiguous: true,
        searchReverseStrand: true
      })
    ).toEqual([
      {
        start: 3,
        end: 7
      }
    ]);
  });
});
