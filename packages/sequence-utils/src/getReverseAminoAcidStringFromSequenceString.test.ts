import getReverseAminoAcidStringFromSequenceString from "./getReverseAminoAcidStringFromSequenceString";
import assert from "assert";

describe("getReverseAminoAcidStringFromSequenceString", () => {
  it("computes a aa string from dna", () => {
    assert.equal("M", getReverseAminoAcidStringFromSequenceString("cat"));
    assert.equal("H", getReverseAminoAcidStringFromSequenceString("atg"));
    assert.equal("HH", getReverseAminoAcidStringFromSequenceString("atgatg"));
    assert.equal("", getReverseAminoAcidStringFromSequenceString("at"));
  });
});
