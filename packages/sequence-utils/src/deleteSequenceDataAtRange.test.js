//tnr: half finished test.
// let tap = require('tap');
// tap.mochaGlobals();
const chai = require("chai");
const { getRangeLength } = require("@teselagen/range-utils");
const { cloneDeep } = require("lodash");

chai.should();
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);

const deleteSequenceDataAtRange = require("./deleteSequenceDataAtRange");

describe("deleteSequenceDataAtRange", function() {
  it("Deletes everything if the range spans the whole sequence", function() {
    let existingSequence = {
      sequence: "atagatag"
    };
    let range = { start: 0, end: 7 };
    let postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, range);
    postDeleteSeqData.sequence.length.should.equal(
      existingSequence.sequence.length - getRangeLength(range)
    );
  });
  it("Deletes everything if the range spans the whole sequence (circular selection)", function() {
    let existingSequence = {
      sequence: "atagatag"
    };
    let range = { start: 4, end: 3 };
    let postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, range);
    postDeleteSeqData.sequence.length.should.equal(
      existingSequence.sequence.length -
        getRangeLength(range, existingSequence.sequence.length)
    );
  });
  it("Delete characters at correct range", function() {
    let existingSequence = {
      sequence: "atagatag"
    };
    let range = { start: 3, end: 5 };
    let postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, range);
    postDeleteSeqData.sequence.length.should.equal(
      existingSequence.sequence.length - getRangeLength(range)
    );
  });
  it("does not mutate the original sequence", function() {
    let existingSequence = {
      sequence: "atagatag",
      features: {
        "1": {
          start: 7,
          end: 7
        }
      }
    };
    const clonedExistingSeq = cloneDeep(existingSequence);
    let range = { start: 3, end: 5 };
    let postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, range);
    existingSequence.should.deep.equal(clonedExistingSeq);
    postDeleteSeqData.sequence.length.should.equal(
      existingSequence.sequence.length - getRangeLength(range)
    );
  });
  it("Handles a non valid range by returning the original sequence", function() {
    let existingSequence = {
      sequence: "atgagagaga",

      features: [
        {
          start: 0,
          end: 9,
          locations: [
            { start: 0, end: 2 },
            { start: 4, end: 9 }
          ]
        }
      ]
    };
    let range = { start: -1, end: -1 };
    let postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, range);
    postDeleteSeqData.should.containSubset({
      sequence: "atgagagaga",
      features: [
        {
          start: 0,
          end: 9,
          locations: [
            { start: 0, end: 2 },
            { start: 4, end: 9 }
          ]
        }
      ]
    });
    postDeleteSeqData.features.length.should.equal(1);
  });
  it("Delete characters and features (with joined locations) at correct range", function() {
    let existingSequence = {
      sequence: "atgagagaga",
      features: [
        {
          start: 0,
          end: 9,
          locations: [
            { start: 0, end: 2 },
            { start: 3, end: 7 },
            { start: 9, end: 9 }
          ]
        }
      ]
    };
    let postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, {
      start: 3,
      end: 7
    });
    postDeleteSeqData.should.containSubset({
      sequence: "atgga",
      features: [
        {
          start: 0,
          end: 4,
          locations: [
            { start: 0, end: 2 },
            { start: 4, end: 4 }
          ]
        }
      ]
    });
    postDeleteSeqData.features.length.should.equal(1);
  });
  it("Moves annotations when delete occurs before annotation", function() {
    let existingSequence = {
      sequence: "atgagagaga",
      parts: [{ start: 5, end: 9 }]
    };
    let postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, {
      start: 3,
      end: 3
    });
    postDeleteSeqData.should.containSubset({
      sequence: "atggagaga",
      parts: [{ start: 4, end: 8 }]
    });
    postDeleteSeqData.parts.length.should.equal(1);
  });
});
