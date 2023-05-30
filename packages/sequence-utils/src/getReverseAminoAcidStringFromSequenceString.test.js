var getReverseAminoAcidStringFromSequenceString = require("./getReverseAminoAcidStringFromSequenceString");
var assert = require("assert");

describe("getReverseAminoAcidStringFromSequenceString", function() {
  it("computes a aa string from dna", function() {
    assert.equal("M", getReverseAminoAcidStringFromSequenceString("cat"));
    assert.equal("H", getReverseAminoAcidStringFromSequenceString("atg"));
    assert.equal("HH", getReverseAminoAcidStringFromSequenceString("atgatg"));
    assert.equal("", getReverseAminoAcidStringFromSequenceString("at"));
  });
});
