import annotateSingleSeq from "./annotateSingleSeq";
import { expect } from "chai";

describe("annotateSingleSeq", () => {
  it(`regexes work - correctly annotates a single seq with a regex annotation`, () => {
    const results = annotateSingleSeq({
      fullSeq: { sequence: "AAAATTTTGGGGGCCCCCAAGT" },
      searchSeq: { sequence: "TTTT.*CCC" }
    });
    // eslint-disable-next-line no-unused-expressions
    expect(results).to.not.be.undefined;
    //this should return an object keyed by the sequence id with the list of annotations to create
    expect(results).to.deep.eq({
      matches: [
        {
          start: 4,
          end: 17,
          strand: 1,
          id: "searchSeqId"
        }
      ]
    });
  });
  it(`correctly annotates a single seq with multiple matches`, () => {
    const results = annotateSingleSeq({
      fullSeq: { sequence: "AAAATTTTGGGGGCCCCCAAGTAAAATTTTGGGGGCCCCCAAGT" },
      searchSeq: { sequence: "AAAATTTTGGGGGCCCCCAAGT", id: 2 }
    });
    // eslint-disable-next-line no-unused-expressions
    expect(results).to.not.be.undefined;
    //this should return an object keyed by the sequence id with the list of annotations to create
    expect(results).to.deep.eq({
      matches: [
        {
          start: 0,
          end: 21,
          strand: 1,
          id: 2
        },
        {
          start: 22,
          end: 43,
          strand: 1,
          id: 2
        }
      ]
    });
  });
  it(`correctly finds no matches when there are none`, () => {
    const results = annotateSingleSeq({
      fullSeq: { sequence: "AAAATTTTGGGGGCCCCCAAGTAAAATTTTGGGGGCCCCCAAGT" },
      searchSeq: { sequence: "AAAATTTTGGGGGGGGGGCCCCCAAGT" }
    });
    // eslint-disable-next-line no-unused-expressions
    expect(results).to.not.be.undefined;
    //this should return an object keyed by the sequence id with the list of annotations to create
    expect(results).to.deep.eq({
      matches: []
    });
  });
});
