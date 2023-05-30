import chai from "chai";
chai.should();
import getReverseSequenceString from "./getReverseSequenceString";
describe("getReverseSequenceAndAnnotations", () => {
  it("handles a range option correctly and reverse complements a subset of the sequence across the origin ", () => {
    const newSeq = getReverseSequenceString("uuuucccttt");
    newSeq.should.eq("tttcccuuuu");
  });
});
