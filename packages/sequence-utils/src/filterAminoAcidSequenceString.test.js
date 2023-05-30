var assert = require("assert");
var filterAminoAcidSequenceString = require("./filterAminoAcidSequenceString");
describe("filterAminoAcidSequenceString", function() {
  it("should filter only valid amino acids by default", function() {
    var filteredString = filterAminoAcidSequenceString(
      'bbb342"""xtgalmfwkqespvicyhrnd,,../'
    );
    assert.equal(filteredString, "xtgalmfwkqespvicyhrnd");
  });
  it("should handle upper case letters", function() {
    var filteredString = filterAminoAcidSequenceString("xtgalmfWKQEspvicyhrnd");
    assert.equal(filteredString, "xtgalmfWKQEspvicyhrnd");
  });
  it("should handle the option to includeStopCodon by allowing periods", function() {
    var options = { includeStopCodon: true };
    var filteredString = filterAminoAcidSequenceString(
      'bbb342"""xtgalmfwkqespvicyhrnd,,../',
      options
    );
    assert.equal(filteredString, "xtgalmfwkqespvicyhrnd..");
  });
});
