import getImportMatches from "../src/utils/getImportMatches";

describe("getImportMatches", () => {
  const destinationSequenceData = {
    sequence: "atgcgtacgtccctaaaggggg", // 22 bps, changed trailing part to be unique
    circular: true,
    features: [
      {
        id: "existing1",
        start: 0,
        end: 5, // 6 bps
        type: "misc_feature",
        name: "existing1"
      }
    ],
    parts: [],
    primers: []
  };

  const sourceSequences = [
    {
      name: "source1",
      sequence: "atgcgtacgtccctaaaggggg",
      features: [
        {
          id: "feat1",
          start: 0,
          end: 5, // 6 bps: atgcgt
          type: "misc_feature",
          name: "feat1"
        },
        {
          id: "feat2",
          start: 6,
          end: 11, // 6 bps: acgtcc
          type: "cds",
          name: "feat2"
        }
      ],
      parts: [],
      primers: []
    }
  ];

  it("should return empty arrays if no source sequences", () => {
    const result = getImportMatches({
      sourceSequences: [],
      destinationSequenceData,
      isFlexible: false,
      matchThreshold: 100,
      minImportSize: 0
    });
    expect(result.newAnnotations).toEqual([]);
    expect(result.duplicateAnnotations).toEqual([]);
  });

  it("should correctly identify new and duplicate annotations", () => {
    const result = getImportMatches({
      sourceSequences,
      destinationSequenceData,
      isFlexible: false,
      matchThreshold: 100,
      minImportSize: 0
    });

    // feat1 should be a duplicate because existing1 is at 0-5
    expect(result.duplicateAnnotations.length).toBe(1);
    expect(result.duplicateAnnotations[0].name).toBe("feat1");
    expect(result.duplicateAnnotations[0].start).toBe(0);
    expect(result.duplicateAnnotations[0].end).toBe(5);

    // feat2 should be new
    expect(result.newAnnotations.length).toBe(1);
    expect(result.newAnnotations[0].name).toBe("feat2");
    expect(result.newAnnotations[0].start).toBe(6);
    expect(result.newAnnotations[0].end).toBe(11);
  });

  it("should respect minImportSize", () => {
    const result = getImportMatches({
      sourceSequences,
      destinationSequenceData,
      isFlexible: false,
      matchThreshold: 100,
      minImportSize: 10 // features are only 5 bps long
    });

    expect(result.newAnnotations.length).toBe(0);
    expect(result.duplicateAnnotations.length).toBe(0);
  });

  it("should handle flexible matching", () => {
    const destinationSequenceDataMismatched = {
      ...destinationSequenceData,
      sequence: "atga" + destinationSequenceData.sequence.slice(4) // Change first 4 bps
    };

    // Exact match should fail
    const exactResult = getImportMatches({
      sourceSequences,
      destinationSequenceData: destinationSequenceDataMismatched,
      isFlexible: false,
      matchThreshold: 100,
      minImportSize: 0
    });
    expect(exactResult.newAnnotations.length).toBe(1); // feat2 still matches
    expect(exactResult.duplicateAnnotations.length).toBe(0); // feat1 doesn't match anymore

    // Flexible match should succeed
    const flexibleResult = getImportMatches({
      sourceSequences,
      destinationSequenceData: destinationSequenceDataMismatched,
      isFlexible: true,
      matchThreshold: 50, // very low threshold to allow mismatch
      minImportSize: 0
    });

    // feat1 should now match (even if it's a mismatch)
    expect(
      flexibleResult.newAnnotations.length +
        flexibleResult.duplicateAnnotations.length
    ).toBe(2);
  });

  it("should correctly handle circular sequences", () => {
    const sourceSeqCircular = [
      {
        name: "sourceCirc",
        sequence: "atgcgtacgt", // 10 bps
        features: [
          {
            id: "featCirc",
            start: 8,
            end: 3, // 6 bps: gt atgc
            type: "misc_feature",
            name: "featCirc"
          }
        ]
      }
    ];

    const destSeqCircular = {
      sequence: "atgcgtacgt",
      circular: true,
      features: []
    };

    const result = getImportMatches({
      sourceSequences: sourceSeqCircular,
      destinationSequenceData: destSeqCircular,
      isFlexible: false,
      matchThreshold: 100,
      minImportSize: 0
    });

    expect(result.newAnnotations.length).toBe(1);
    expect(result.newAnnotations[0].start).toBe(8);
    expect(result.newAnnotations[0].end).toBe(3); // 8, 9, 0, 1, 2, 3 = 6 bps
  });
});
