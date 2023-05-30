//tnr: half finished test.


import chai from "chai";

chai.should();
import chaiSubset from "chai-subset";
chai.use(chaiSubset);

import adjustBpsToReplaceOrInsert from "./adjustBpsToReplaceOrInsert";

describe("adjustBpsToReplaceOrInsert", () => {
  it("inserts characters at correct caret position", () => {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", 0).should.equal(
      "xxxtttgggaaaccc"
    );
  });
  it("inserts characters at correct caret position", () => {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", 3).should.equal(
      "tttxxxgggaaaccc"
    );
  });

  it("inserts characters at correct caret position", () => {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", 12).should.equal(
      "tttgggaaacccxxx"
    );
  });
  it("can replace whole sequence with upper case", () => {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "TTTGGGAAACCC", {
      start: 0,
      end: 11
    }).should.equal("TTTGGGAAACCC");
  });
  it("can replace whole sequence with just a couple chars", () => {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xx", {
      start: 0,
      end: 11
    }).should.equal("xx");
  });
  it("inserts characters at correct range 0 0", () => {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", {
      start: 0,
      end: 0
    }).should.equal("xxxttgggaaaccc");
  });
  it("inserts characters at correct range 11 11", () => {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", {
      start: 11,
      end: 11
    }).should.equal("tttgggaaaccxxx");
  });
  it("inserts characters at correct range 11 0", () => {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", {
      start: 11,
      end: 0
    }).should.equal("xxxttgggaaacc");
  });
});
