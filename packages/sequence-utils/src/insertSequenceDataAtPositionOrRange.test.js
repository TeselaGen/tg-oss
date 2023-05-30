//tnr: half finished test.


import chai from "chai";

import {getRangeLength} from "@teselagen/range-utils";
import assert from "assert";

chai.should();
import chaiSubset from "chai-subset";
chai.use(chaiSubset);

import insertSequenceDataAtPositionOrRange from "./insertSequenceDataAtPositionOrRange";

describe("insertSequenceData", () => {
  it("adjusts annotations to protein-only inserts correctly", () => {
    let sequenceToInsert = {
      proteinSequence: "IDR",
      isProtein: true
    };
    let sequenceToInsertInto = {
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
    let caret = 3;
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
    let sequenceToInsert = {
      isProtein: true,
      sequence: "atagatagg",
      proteinSequence: "IDR"
    };
    let sequenceToInsertInto = {
      //  012345
      isProtein: true,
      sequence: "atgagagagaaa",
      proteinSequence: "MREK"
    };
    let caret = 3;
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      caret
    );
    postInsertSeq.sequence.should.equal("atgatagataggagagagaaa");
    postInsertSeq.proteinSequence.should.equal("MIDRREK");
  });
  it("inserts protein and dna characters at correct range", () => {
    let sequenceToInsert = {
      isProtein: true,
      sequence: "atagatagg",
      proteinSequence: "IDR"
    };
    let sequenceToInsertInto = {
      //  012345
      isProtein: true,
      sequence: "atgagagagaaa",
      proteinSequence: "MREK"
    };
    let range = { start: 3, end: 5 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.should.equal("atgatagatagggagaaa");
    postInsertSeq.proteinSequence.should.equal("MIDREK");
  });
  it("inserts characters at correct range and computes the new size correctly", () => {
    let sequenceToInsert = {
      sequence: "rrrrrrr"
    };
    let sequenceToInsertInto = {
      sequence: "atgagagaga"
    };
    let range = { start: 3, end: 5 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
    let sequenceToInsert = {
      sequence: "rrrrrrr",
      //         fffffff
      features: [{ name: "feat1", start: 0, end: 6 }]
    };
    let sequenceToInsertInto = {
      sequence: "atgagagaga",
      //             fff
      features: [{ name: "feat2", start: 4, end: 6 }]
    };
    let range = { start: 8, end: 2 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
    let sequenceToInsert = {
      sequence: "xrrrrry",
      //         fffffff
      features: [{ name: "feat1", start: 0, end: 6 }]
    };
    let sequenceToInsertInto = {
      //         sss     ss
      sequence: "atgagagaga",
      //             fff
      features: [{ name: "feat2", start: 4, end: 6 }]
    };
    let range = { start: 8, end: 2 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range,
      {
        maintainOriginSplit: true
      }
    );
    postInsertSeq.sequence.should.equal("rrrryagagaxr");
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
    let sequenceToInsert = {
      sequence: "r",
      //         fffffff
      features: [{ name: "feat1", start: 0, end: 0 }]
    };
    let sequenceToInsertInto = {
      //         sss     ss
      sequence: "atgagagaga",
      //             fff
      features: [{ name: "feat2", start: 4, end: 6 }]
    };
    let range = { start: 8, end: 2 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
    let sequenceToInsert = {
      sequence: "atgagagaga"
    };
    let sequenceToInsertInto = {
      sequence: "atagatag",
      name: "thomasDaMan!",
      circular: true
    };
    let range = { start: 3, end: 5 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
    let sequenceToInsert = {
      sequence: "atgagagaga"
    };
    let sequenceToInsertInto = {
      sequence: "g"
    };
    let caretPosition = 0;
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      caretPosition
    );
    postInsertSeq.sequence.length.should.equal(
      sequenceToInsertInto.sequence.length + sequenceToInsert.sequence.length
    );
  });
  it("inserts characters when whole sequence is selected but maintains properties like circularity, name", () => {
    let sequenceToInsert = {
      sequence: "atgagagaga"
    };
    let sequenceToInsertInto = {
      sequence: "ggggaaaa",
      circular: true,
      name: "testName"
    };
    let range = { start: 0, end: 7 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
    let sequenceToInsert = {
      sequence: "atgagagaga"
    };
    let sequenceToInsertInto = {
      sequence: "atgagagaga",
      features: [{ start: 0, end: 9 }],
      warnings: [{ start: 0, end: 9 }]
    };
    let caretPosition = 0;
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
    let sequenceToInsert = {};
    let sequenceToInsertInto = {
      sequence: "atgagagaga",
      chromatogramData: { baseTraces: [] },
      features: [{ start: 0, end: 9 }],
      warnings: [{ start: 0, end: 9 }]
    };
    let range = { start: 0, end: 9 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
    let sequenceToInsert = {};
    let sequenceToInsertInto = {
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
    let range = { start: 2, end: 3 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.length.should.equal(8);
    postInsertSeq.chromatogramData.baseCalls.length.should.equal(8);
    postInsertSeq.chromatogramData.baseTraces.length.should.equal(8);
  });
  it("properly inserts into chromatogramData", () => {
    let sequenceToInsert = {
      sequence: "rrr"
    };
    let sequenceToInsertInto = {
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
    let range = { start: 3, end: 4 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
      sequenceToInsert,
      sequenceToInsertInto,
      range
    );
    postInsertSeq.sequence.length.should.equal(8);
    postInsertSeq.chromatogramData.baseCalls.length.should.equal(8);
    postInsertSeq.chromatogramData.baseTraces.length.should.equal(8);
    postInsertSeq.chromatogramData.baseTraces[4].aTrace.should.deep.equal([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]);
  });
  it("properly inserts into chromatogramData, keeping the chromatogramData intact if the insert length is the same length as the selection range", () => {
    let sequenceToInsert = {
      sequence: "rrr"
    };
    let sequenceToInsertInto = {
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
    let range = { start: 3, end: 5 };
    let postInsertSeq = insertSequenceDataAtPositionOrRange(
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
      0,
      2,
      6,
      8
    ]);
  });
});
