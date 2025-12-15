import findApproxMatches from "./findApproxMatches";

describe("findApproxMatches", () => {
  it("returns exact matches with maxMismatches=0", () => {
    // Test with DNA sequence
    expect(findApproxMatches("ATG", "GATGC", 0)).toEqual([
      { index: 1, match: "ATG", mismatchPositions: [], numMismatches: 0 }
    ]);

    // Test with no matches
    expect(findApproxMatches("ATG", "GCCTA", 0)).toEqual([]);
  });

  it("finds matches with allowed mismatches", () => {
    // One mismatch allowed, one actual mismatch
    expect(findApproxMatches("ATG", "ACTG", 1)).toEqual([
      { index: 1, match: "CTG", mismatchPositions: [0], numMismatches: 1 }
    ]);

    // Two mismatches allowed, two actual mismatches
    expect(findApproxMatches("ATGC", "ACGA", 2)).toEqual([
      { index: 0, match: "ACGA", mismatchPositions: [1, 3], numMismatches: 2 }
    ]);

    // Multiple matches with mismatches
    expect(findApproxMatches("AGT", "AGTCAATAGTAAGTG", 1)).toEqual([
      { index: 0, match: "AGT", mismatchPositions: [], numMismatches: 0 },
      { index: 4, match: "AAT", mismatchPositions: [1], numMismatches: 1 },
      { index: 7, match: "AGT", mismatchPositions: [], numMismatches: 0 },
      { index: 11, match: "AGT", mismatchPositions: [], numMismatches: 0 }
    ]);
  });

  it("respects the maximum mismatch threshold", () => {
    // Three mismatches are too many when max is 2
    expect(findApproxMatches("ATGC", "ACAA", 2)).toEqual([]);

    // Three mismatches are allowed when max is 3
    expect(findApproxMatches("ATGC", "ACAA", 3)).toEqual([
      {
        index: 0,
        match: "ACAA",
        mismatchPositions: [1, 2, 3],
        numMismatches: 3
      }
    ]);
  });

  it("handles circular sequences correctly", () => {
    // Non-circular sequence
    expect(findApproxMatches("ATG", "TGA", 0, false)).toEqual([]);

    // Circular sequence - match wraps around the end
    expect(findApproxMatches("ATG", "TGA", 0, true)).toEqual([
      { index: 2, match: "ATG", mismatchPositions: [], numMismatches: 0 }
    ]);

    // Circular sequence with mismatches
    expect(findApproxMatches("ATG", "TGC", 1, true)).toEqual([
      { index: 2, match: "CTG", mismatchPositions: [0], numMismatches: 1 }
    ]);
  });

  it("handles edge cases", () => {
    // Empty search sequence - returns matches at every position
    expect(findApproxMatches("", "ATGC", 0)).toEqual([
      { index: 0, match: "", mismatchPositions: [], numMismatches: 0 },
      { index: 1, match: "", mismatchPositions: [], numMismatches: 0 },
      { index: 2, match: "", mismatchPositions: [], numMismatches: 0 },
      { index: 3, match: "", mismatchPositions: [], numMismatches: 0 },
      { index: 4, match: "", mismatchPositions: [], numMismatches: 0 }
    ]);

    // Empty target sequence
    expect(findApproxMatches("ATG", "", 0)).toEqual([]);

    // Search sequence longer than target
    expect(findApproxMatches("ATGCG", "ATGC", 0)).toEqual([]);

    // Exactly matching length sequences
    expect(findApproxMatches("ATGC", "ATGC", 0)).toEqual([
      { index: 0, match: "ATGC", mismatchPositions: [], numMismatches: 0 }
    ]);

    // Sequences with special characters
    expect(findApproxMatches("AT-G", "AT-GC", 0)).toEqual([
      { index: 0, match: "AT-G", mismatchPositions: [], numMismatches: 0 }
    ]);
  });

  it("handles larger sequences efficiently", () => {
    const longTarget = "ATGCGATCGATCGATCGATCGATCGATCGATCG";
    const longSearch = "ATCGATCG";

    // The actual positions where the pattern appears in the sequence
    const expected = [
      { index: 5, match: "ATCGATCG", mismatchPositions: [], numMismatches: 0 },
      { index: 9, match: "ATCGATCG", mismatchPositions: [], numMismatches: 0 },
      { index: 13, match: "ATCGATCG", mismatchPositions: [], numMismatches: 0 },
      { index: 17, match: "ATCGATCG", mismatchPositions: [], numMismatches: 0 },
      { index: 21, match: "ATCGATCG", mismatchPositions: [], numMismatches: 0 },
      { index: 25, match: "ATCGATCG", mismatchPositions: [], numMismatches: 0 }
    ];

    // Only include indices where we have full matches (length of search string)
    const actual = findApproxMatches(longSearch, longTarget, 0).filter(
      m => m.match.length === longSearch.length
    );

    expect(actual).toEqual(expected);
  });

  it("tracks exact positions of mismatches", () => {
    // Test specific positions of mismatches
    const result = findApproxMatches("ATGCTA", "ATCCAA", 2);

    expect(result).toEqual([
      {
        index: 0,
        match: "ATCCAA",
        mismatchPositions: [2, 4],
        numMismatches: 2
      }
    ]);
  });
});
