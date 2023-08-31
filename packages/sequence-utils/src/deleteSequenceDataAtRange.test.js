//tnr: half finished test.

import chai from "chai";

import { getRangeLength } from "@teselagen/range-utils";
import { cloneDeep } from "lodash";
import chaiSubset from "chai-subset";

import deleteSequenceDataAtRange from "./deleteSequenceDataAtRange";

chai.should();
chai.use(chaiSubset);

describe("deleteSequenceDataAtRange", () => {
  it("Deletes everything if the range spans the whole sequence", () => {
    const existingSequence = {
      sequence: "atagatag"
    };
    const range = { start: 0, end: 7 };
    const postDeleteSeqData = deleteSequenceDataAtRange(
      existingSequence,
      range
    );
    postDeleteSeqData.sequence.length.should.equal(
      existingSequence.sequence.length - getRangeLength(range)
    );
  });
  it("Deletes everything if the range spans the whole sequence (circular selection)", () => {
    const existingSequence = {
      sequence: "atagatag"
    };
    const range = { start: 4, end: 3 };
    const postDeleteSeqData = deleteSequenceDataAtRange(
      existingSequence,
      range
    );
    postDeleteSeqData.sequence.length.should.equal(
      existingSequence.sequence.length -
        getRangeLength(range, existingSequence.sequence.length)
    );
  });
  it("Delete characters at correct range", () => {
    const existingSequence = {
      sequence: "atagatag"
    };
    const range = { start: 3, end: 5 };
    const postDeleteSeqData = deleteSequenceDataAtRange(
      existingSequence,
      range
    );
    postDeleteSeqData.sequence.length.should.equal(
      existingSequence.sequence.length - getRangeLength(range)
    );
  });
  it("does not mutate the original sequence", () => {
    const existingSequence = {
      sequence: "atagatag",
      features: {
        1: {
          start: 7,
          end: 7
        }
      }
    };
    const clonedExistingSeq = cloneDeep(existingSequence);
    const range = { start: 3, end: 5 };
    const postDeleteSeqData = deleteSequenceDataAtRange(
      existingSequence,
      range
    );
    existingSequence.should.deep.equal(clonedExistingSeq);
    postDeleteSeqData.sequence.length.should.equal(
      existingSequence.sequence.length - getRangeLength(range)
    );
  });
  it("Handles a non valid range by returning the original sequence", () => {
    const existingSequence = {
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
    const range = { start: -1, end: -1 };
    const postDeleteSeqData = deleteSequenceDataAtRange(
      existingSequence,
      range
    );
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
  it("Delete characters and features (with joined locations) at correct range", () => {
    const existingSequence = {
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
    const postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, {
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
  it("Moves annotations when delete occurs before annotation", () => {
    const existingSequence = {
      sequence: "atgagagaga",
      parts: [{ start: 5, end: 9 }]
    };
    const postDeleteSeqData = deleteSequenceDataAtRange(existingSequence, {
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
