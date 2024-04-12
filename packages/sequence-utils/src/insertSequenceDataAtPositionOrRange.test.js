//tnr: half finished test.

import chai from "chai";

import { getRangeLength } from "@teselagen/range-utils";
import assert from "assert";
import chaiSubset from "chai-subset";

import insertSequenceDataAtPositionOrRange from "./insertSequenceDataAtPositionOrRange";

chai.should();
chai.use(chaiSubset);

describe("insertSequenceData", () => {
  it("adjusts annotations to protein-only inserts correctly", () => {
    const sequenceToInsert = {
      proteinSequence: "IDR",
      isProtein: true
    };
    const sequenceToInsertInto = {
      //  012345
      features: [{ name: "feat2", start: 0, end: 5 }],
      //         M  R  E  K
      //         012345678901
      sequence: "atgagagagaaa",
      proteinSequence: "MREK",
      isProtein: true
    };
    //         M  I  D  R  R  E  K
    //         012345678901234567890
    //         atgauhgaymngagagagaaa
    const caret = 3;
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      caret
    );
    postInsertSeq.sequence.should.equal("atgathgaymgnagagagaaa");
    postInsertSeq.proteinSequence.should.equal("MIDRREK");
    postInsertSeq.features.should.containSubset([
      { name: "feat2", start: 0, end: 14 }
    ]);
  });
  it("inserts protein and dna characters at correct caret", () => {
    const sequenceToInsert = {
      isProtein: true,
      sequence: "atagatagg",
      proteinSequence: "IDR"
    };
    const sequenceToInsertInto = {
      //  012345
      isProtein: true,
      sequence: "atgagagagaaa",
      proteinSequence: "MREK"
    };
    const caret = 3;
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      caret
    );
    postInsertSeq.sequence.should.equal("atgatagataggagagagaaa");
    postInsertSeq.proteinSequence.should.equal("MIDRREK");
  });
  it("inserts protein and dna characters at correct range", () => {
    const sequenceToInsert = {
      isProtein: true,
      sequence: "atagatagg",
      proteinSequence: "IDR"
    };
    const sequenceToInsertInto = {
      //  012345
      isProtein: true,
      sequence: "atgagagagaaa",
      proteinSequence: "MREK"
    };
    const range = { start: 3, end: 5 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.should.equal("atgatagatagggagaaa");
    postInsertSeq.proteinSequence.should.equal("MIDREK");
  });
  it("inserts protein seq into a dna seq correctly", () => {
    const sequenceToInsert = {
      isProtein: true,
      sequence: "atagatagg",
      proteinSequence: "IDR"
    };
    const sequenceToInsertInto = {
      //  012345
      isProtein: false,
      sequence: "atgagagagaaa",
      proteinSequence: "MREK"
    };
    const range = { start: 3, end: 5 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.should.equal("atgatagatagggagaaa");
    postInsertSeq.isProtein.should.equal(false);
    postInsertSeq.proteinSequence.should.equal("MIDREK");
  });
  it("inserts characters at correct range and computes the new size correctly", () => {
    const sequenceToInsert = {
      sequence: "rrrrrrr"
    };
    const sequenceToInsertInto = {
      sequence: "atgagagaga"
    };
    const range = { start: 3, end: 5 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.should.equal("atgrrrrrrrgaga");
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsertInto.sequence.length +
        sequenceToInsert.sequence.length -
        getRangeLength(range)
    );
    postInsertSeq.sequence.length.should.equal(postInsertSeq.size);
  });
  it("inserts characters at correct origin spanning range", () => {
    const sequenceToInsert = {
      sequence: "rrrrrrr",
      //         fffffff
      features: [{ name: "feat1", start: 0, end: 6 }]
    };
    const sequenceToInsertInto = {
      sequence: "atgagagaga",
      //             fff
      features: [{ name: "feat2", start: 4, end: 6 }]
    };
    const range = { start: 8, end: 2 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.should.equal("rrrrrrragaga");
    //                                   fffffff fff
    postInsertSeq.features.should.containSubset([
      { name: "feat1", start: 0, end: 6 },
      { name: "feat2", start: 8, end: 10 }
    ]);
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsertInto.sequence.length +
        sequenceToInsert.sequence.length -
        getRangeLength(range, sequenceToInsertInto.sequence.length)
    );
  });
  it("inserts characters at correct origin spanning range with {maintainOriginSplit: true} option", () => {
    const sequenceToInsert = {
      sequence: "crrrrry",
      //         fffffff
      features: [{ name: "feat1", start: 0, end: 6 }]
    };
    const sequenceToInsertInto = {
      //         sss     ss
      sequence: "atgagagaga",
      //             fff
      features: [{ name: "feat2", start: 4, end: 6 }]
    };
    const range = { start: 8, end: 2 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range,
      {
        maintainOriginSplit: true
      }
    );
    postInsertSeq.sequence.should.equal("rrrryagagacr");
    //                                   fffff fff ff
    postInsertSeq.features.should.containSubset([
      { name: "feat1", start: 10, end: 4 },
      { name: "feat2", start: 6, end: 8 }
    ]);
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsertInto.sequence.length +
        sequenceToInsert.sequence.length -
        getRangeLength(range, sequenceToInsertInto.sequence.length)
    );
  });
  it("inserts characters at correct origin spanning range with {maintainOriginSplit: true} option", () => {
    const sequenceToInsert = {
      sequence: "r",
      //         fffffff
      features: [{ name: "feat1", start: 0, end: 0 }]
    };
    const sequenceToInsertInto = {
      //         sss     ss
      sequence: "atgagagaga",
      //             fff
      features: [{ name: "feat2", start: 4, end: 6 }]
    };
    const range = { start: 8, end: 2 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range,
      {
        maintainOriginSplit: true
      }
    );
    postInsertSeq.sequence.should.equal("agagar");
    //                                    fff f
    postInsertSeq.features.should.containSubset([
      { name: "feat1", start: 5, end: 5 },
      { name: "feat2", start: 1, end: 3 }
    ]);
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsertInto.sequence.length +
        sequenceToInsert.sequence.length -
        getRangeLength(range, sequenceToInsertInto.sequence.length)
    );
  });
  it("inserts characters at correct range, and doesn't clobber other properties on the existing sequence data", () => {
    const sequenceToInsert = {
      sequence: "atgagagaga"
    };
    const sequenceToInsertInto = {
      sequence: "atagatag",
      name: "thomasDaMan!",
      circular: true
    };
    const range = { start: 3, end: 5 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsertInto.sequence.length +
        sequenceToInsert.sequence.length -
        getRangeLength(range)
    );
    postInsertSeq.name.should.equal("thomasDaMan!");
    postInsertSeq.circular.should.equal(true);
  });
  it("inserts characters at correct caret position", () => {
    const sequenceToInsert = {
      sequence: "atgagagaga"
    };
    const sequenceToInsertInto = {
      sequence: "g"
    };
    const caretPosition = 0;
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      caretPosition
    );
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsertInto.sequence.length + sequenceToInsert.sequence.length
    );
  });
  it("inserts characters when whole sequence is selected but maintains properties like circularity, name", () => {
    const sequenceToInsert = {
      sequence: "atgagagaga"
    };
    const sequenceToInsertInto = {
      sequence: "ggggaaaa",
      circular: true,
      name: "testName"
    };
    const range = { start: 0, end: 7 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsert.sequence.length
    );
    postInsertSeq.circular.should.equal(sequenceToInsertInto.circular);
    postInsertSeq.name.should.equal(sequenceToInsertInto.name);
  });

  it("inserts characters at correct caret position", () => {
    const sequenceToInsert = {
      sequence: "atgagagaga"
    };
    const sequenceToInsertInto = {
      sequence: "atgagagaga",
      features: [{ start: 0, end: 9 }],
      warnings: [{ start: 0, end: 9 }]
    };
    const caretPosition = 0;
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      caretPosition
    );
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsertInto.sequence.length + sequenceToInsert.sequence.length
    );
    postInsertSeq.features.length.should.equal(1);
    postInsertSeq.features[0].start.should.equal(
      sequenceToInsertInto.features[0].start + sequenceToInsert.sequence.length
    );
    postInsertSeq.warnings.length.should.equal(1);
    postInsertSeq.warnings[0].start.should.equal(
      sequenceToInsertInto.warnings[0].start + sequenceToInsert.sequence.length
    );
  });
  it("deletes the whole sequence if nothing is being inserted and the range spans the entire sequence ", () => {
    const sequenceToInsert = {};
    const sequenceToInsertInto = {
      sequence: "atgagagaga",
      chromatogramData: { baseTraces: [] },
      features: [{ start: 0, end: 9 }],
      warnings: [{ start: 0, end: 9 }]
    };
    const range = { start: 0, end: 9 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.length.should.equal(0);
    postInsertSeq.features.length.should.equal(0);
    postInsertSeq.warnings.length.should.equal(0);
    assert.deepStrictEqual(postInsertSeq.chromatogramData, undefined);
  });
  it("deletes chromatogramData correctly", () => {
    const sequenceToInsert = {};
    const sequenceToInsertInto = {
      sequence: "atgagagaga",
      chromatogramData: {
        baseCalls: ["G", "G", "C", "G", "T", "G", "G", "A", "C", "G"],
        baseTraces: [
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          }
        ]
      }
    };
    const range = { start: 2, end: 3 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.length.should.equal(8);
    postInsertSeq.chromatogramData.baseCalls.length.should.equal(8);
    postInsertSeq.chromatogramData.baseTraces.length.should.equal(8);
  });
  it("properly inserts into chromatogramData", () => {
    const sequenceToInsert = {
      sequence: "rrr"
    };
    const sequenceToInsertInto = {
      sequence: "atgagag",
      chromatogramData: {
        baseCalls: ["G", "G", "C", "G", "T", "G", "G"],
        baseTraces: [
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          }
        ]
      }
    };
    const range = { start: 3, end: 4 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.length.should.equal(8);
    postInsertSeq.chromatogramData.baseCalls.length.should.equal(8);
    postInsertSeq.chromatogramData.baseTraces.length.should.equal(8);
    postInsertSeq.chromatogramData.baseTraces[4].aTrace.should.deep.equal([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]);
  });
  it("properly inserts into chromatogramData, keeping the chromatogramData intact if the insert length is the same length as the selection range", () => {
    const sequenceToInsert = {
      sequence: "rrr"
    };
    const sequenceToInsertInto = {
      sequence: "atgagag",
      chromatogramData: {
        baseCalls: ["G", "G", "C", "G", "T", "G", "G"],
        baseTraces: [
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          },
          {
            aTrace: [0, 2, 6, 8],
            cTrace: [5, 2, 3, 4],
            gTrace: [0, 2, 6, 8],
            tTrace: [5, 2, 3, 4]
          }
        ]
      }
    };
    const range = { start: 3, end: 5 };
    const postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.length.should.equal(7);
    postInsertSeq.chromatogramData.baseCalls.length.should.equal(7);
    postInsertSeq.chromatogramData.baseCalls.should.deep.equal([
      "G",
      "G",
      "C",
      "r",
      "r",
      "r",
      "G"
    ]);
    postInsertSeq.chromatogramData.baseTraces.length.should.equal(7);
    postInsertSeq.chromatogramData.baseTraces[4].aTrace.should.deep.equal([
      0, 2, 6, 8
    ]);
  });
});
