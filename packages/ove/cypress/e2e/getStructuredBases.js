import { getStructuredBases } from "../../src/RowItem/StackedAnnotations/getStructuredBases";

describe("getStructuredBases", () => {
  it("works for fully-overlapping non origin-spanning case", () => {
    const fullSequence = "ACGTCCACGT";
    let primerSeq = "ACGT";
    const start = 0;
    const end = 3;
    let { allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start, end },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "3prime",
      sequenceLength: fullSequence.length
    });

    let expected = [true, true, true, true];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );

    primerSeq = "CCGT";
    ({ allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start, end },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "3prime",
      sequenceLength: fullSequence.length
    }));
    expected = [false, true, true, true];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );
  });
  it("works for non fully-overlapping non origin-spanning case binding on 3prime", () => {
    const fullSequence = "ACGTCCACGT";
    let primerSeq = "aaaaACGT";
    const start = 0;
    const end = 3;
    let { allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start, end },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "3prime",
      sequenceLength: fullSequence.length
    });

    let expected = [false, false, false, false, true, true, true, true];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );
    expected = [
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      false,
      false,
      false
    ];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isAmbiguousMatch }) => isAmbiguousMatch),
      expected
    );

    primerSeq = "aaaaCCGT";
    ({ allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start, end },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "3prime",
      sequenceLength: fullSequence.length
    }));
    expected = [false, false, false, false, false, true, true, true];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );
    expected = [
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      false,
      false,
      false
    ];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isAmbiguousMatch }) => isAmbiguousMatch),
      expected
    );
  });
  it("works for non fully-overlapping non origin-spanning case binding on 5prime", () => {
    const fullSequence = "ACGTCCACGT";
    let primerSeq = "ACGTaaaa";
    const start = 0;
    const end = 3;
    let { allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start, end },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "5prime",
      sequenceLength: fullSequence.length
    });

    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      [true, true, true, true, false, false, false, false]
    );
    assert.deepEqual(
      allBasesWithMetaData.map(({ isAmbiguousMatch }) => isAmbiguousMatch),
      [false, false, false, false, undefined, undefined, undefined, undefined]
    );

    primerSeq = "CCGTaaaa";
    ({ allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start, end },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "5prime",
      sequenceLength: fullSequence.length
    }));
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      [false, true, true, true, false, false, false, false]
    );
    assert.deepEqual(
      allBasesWithMetaData.map(({ isAmbiguousMatch }) => isAmbiguousMatch),
      [false, false, false, false, undefined, undefined, undefined, undefined]
    );
  });
  it("works for origin-spanning case", () => {
    const fullSequence = "ACGTCCACGT";
    let primerSeq = "TACGT";
    const start = 9;
    const end = 3;
    // First part of the primer binding to the origin
    let { allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start: 9, end: 9 },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "3prime",
      sequenceLength: fullSequence.length
    });
    let expected = [true];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );
    // Second part of the primer binding to the origin
    ({ allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start: 0, end: 3 },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "3prime",
      sequenceLength: fullSequence.length
    }));
    expected = [true, true, true, true];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );

    // Mismatch
    primerSeq = "AACGT";
    expected = [false];
    ({ allBasesWithMetaData } = getStructuredBases({
      annotationRange: { start: 9, end: 9 },
      forward: true,
      bases: primerSeq,
      start: start,
      end: end,
      fullSequence,
      primerBindsOn: "3prime",
      sequenceLength: fullSequence.length
    }));
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );
  });
});
