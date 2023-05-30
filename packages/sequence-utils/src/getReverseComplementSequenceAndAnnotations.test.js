const chai = require("chai");
chai.should();
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);
const getReverseComplementSequenceAndAnnotations = require("./getReverseComplementSequenceAndAnnotations");
describe("getReverseComplementSequenceAndAnnotations", function() {
  it("reverse complements an annotation ", function() {
    const newSeq = getReverseComplementSequenceAndAnnotations({
      sequence: "aaatttcccg",
      circular: true,
      features: [
        {
          start: 3,
          end: 5
        },
        {
          start: 8,
          end: 2
        }
      ]
    });
    newSeq.should.containSubset({
      sequence: "cgggaaattt",
      features: [
        {
          start: 4,
          end: 6,
          forward: true
        },
        {
          start: 7,
          end: 1,
          forward: true
        }
      ]
    });
  });

  it("handles a range option correctly and reverse complements a subset of the sequence ", function() {
    const newSeq = getReverseComplementSequenceAndAnnotations(
      {
        sequence: "aaatttcccgttt",
        circular: true,
        features: [
          {
            start: 3,
            end: 5
          }
        ]
      },
      { range: { start: 0, end: 9 } }
    );
    newSeq.should.containSubset({
      sequence: "cgggaaattt",
      features: [
        {
          start: 4,
          end: 6,
          forward: true
        }
      ]
    });
  });
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", function() {
    const newSeq = getReverseComplementSequenceAndAnnotations(
      {
        sequence: "aaatttcccgttt",
        //         0123456789
        //         rrr   rrrrrrr
        //            fffff
        circular: true,
        features: [
          {
            start: 3,
            end: 7
          }
        ]
      },
      { range: { start: 6, end: 2 } }
    );
    newSeq.should.containSubset({
      sequence: "tttaaacggg",
      features: [
        {
          start: 8,
          end: 9,
          forward: true
        }
      ]
    });
  });
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", function() {
    const newSeq = getReverseComplementSequenceAndAnnotations(
      {
        sequence: "cccttt"
        //         012345
        //         rr  rr
      },
      { range: { start: 4, end: 1 } }
    );
    newSeq.should.containSubset({
      sequence: "ggaa"
    });
  });
});
