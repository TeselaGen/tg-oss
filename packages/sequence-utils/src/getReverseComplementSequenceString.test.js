import chai from "chai";
chai.should();
import chaiSubset from "chai-subset";
chai.use(chaiSubset);
import getReverseComplementSequenceString from "./getReverseComplementSequenceString";
describe("getReverseComplementSequenceAndAnnotations", () => {
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", () => {
    const newSeq = getReverseComplementSequenceString("uuuucccttt");
    newSeq.should.eq("aaagggaaaa");
  });
});
