import chai from "chai";
import getReverseSequenceString from "./getReverseSequenceString";
chai.should();
describe("getReverseSequenceAndAnnotations", () => {
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", () => {
    const newSeq = getReverseSequenceString("uuuucccttt");
    newSeq.should.eq("tttcccuuuu");
  });
});
