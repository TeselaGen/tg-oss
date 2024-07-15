import { getStructuredBases } from "../../../src/RowItem/StackedAnnotations/getStructuredBases";

describe("getStructuredBases", () => {
  it.skip("works for non origin-spanning case", () => {
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
  it("works for origin-spanning case", () => {
    const fullSequence = "ACGTCCACGT";
    let primerSeq = "TACGT";
    const start = 9;
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
    let expected = [true, true, true, true, true];
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );
    primerSeq = "AACGT";
    expected = [false, true, true, true, true];
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
    cy.task("log", allBasesWithMetaData);
    assert.deepEqual(
      allBasesWithMetaData.map(({ isMatch }) => isMatch),
      expected
    );
  });
});
