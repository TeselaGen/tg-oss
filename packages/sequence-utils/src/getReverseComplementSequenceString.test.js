import * as chai from "chai";
import chaiSubset from "chai-subset";
import getReverseComplementSequenceString from "./getReverseComplementSequenceString";
chai.should();
chai.use(chaiSubset);
describe("getReverseComplementSequenceAndAnnotations", () => {
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", () => {
    const newSeq = getReverseComplementSequenceString("uuuucccttt");
    newSeq.should.eq("aaagggaaaa");
  });
});
