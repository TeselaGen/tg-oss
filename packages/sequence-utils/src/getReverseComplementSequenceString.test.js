const chai = require("chai");
chai.should();
const chaiSubset = require("chai-subset");
chai.use(chaiSubset);
const getReverseComplementSequenceString = require("./getReverseComplementSequenceString");
describe("getReverseComplementSequenceAndAnnotations", function() {
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", function() {
    const newSeq = getReverseComplementSequenceString("uuuucccttt");
    newSeq.should.eq("aaagggaaaa");
  });
});
