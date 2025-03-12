import * as chai from "chai";
import chaiSubset from "chai-subset";
import getReverseComplementSequenceAndAnnotations from "./getReverseComplementSequenceAndAnnotations";
chai.should();
chai.use(chaiSubset);
describe("getReverseComplementSequenceAndAnnotations", () => {
  it("reverse complements an annotation ", () => {
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

  it("handles a range option correctly and reverse complements a subset of the sequence ", () => {
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
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", () => {
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
  it("handles reverse complementing a feature with locations correctly", () => {
    const newSeq = getReverseComplementSequenceAndAnnotations({
      sequence: "aaatttcccgttttttt",
      //         01234567890123456
      //          fffffff
      //          lll  ll
      // after:
      //         65432109876543210
      //                  fffffff
      //                  ll  lll
      circular: true,
      features: [
        {
          start: 1,
          end: 7,
          locations: [
            {
              start: 1,
              end: 3
            },
            {
              start: 6,
              end: 7
            }
          ]
        }
      ]
    });
    newSeq.should.containSubset({
      // sequence: "tttaaacggg",
      features: [
        {
          start: 9,
          end: 15,
          forward: true,
          locations: [
            {
              start: 9,
              end: 10
            },
            {
              start: 13,
              end: 15
            }
          ]
        }
      ]
    });
  });
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", () => {
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
