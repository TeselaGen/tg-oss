//tnr: half finished test.
// let tap = require('tap');
// tap.mochaGlobals();
const chai = require("chai");
chai.should();
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);

const adjustBpsToReplaceOrInsert = require("./adjustBpsToReplaceOrInsert");

describe("adjustBpsToReplaceOrInsert", function() {
  it("inserts characters at correct caret position", function() {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", 0).should.equal(
      "xxxtttgggaaaccc"
    );
  });
  it("inserts characters at correct caret position", function() {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", 3).should.equal(
      "tttxxxgggaaaccc"
    );
  });

  it("inserts characters at correct caret position", function() {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", 12).should.equal(
      "tttgggaaacccxxx"
    );
  });
  it("can replace whole sequence with upper case", function() {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "TTTGGGAAACCC", {
      start: 0,
      end: 11
    }).should.equal("TTTGGGAAACCC");
  });
  it("can replace whole sequence with just a couple chars", function() {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xx", {
      start: 0,
      end: 11
    }).should.equal("xx");
  });
  it("inserts characters at correct range 0 0", function() {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", {
      start: 0,
      end: 0
    }).should.equal("xxxttgggaaaccc");
  });
  it("inserts characters at correct range 11 11", function() {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", {
      start: 11,
      end: 11
    }).should.equal("tttgggaaaccxxx");
  });
  it("inserts characters at correct range 11 0", function() {
    adjustBpsToReplaceOrInsert("tttgggaaaccc", "xxx", {
      start: 11,
      end: 0
    }).should.equal("xxxttgggaaacc");
  });
});
