import assert from "assert";
import filterAminoAcidSequenceString from "./filterAminoAcidSequenceString";
describe("filterAminoAcidSequenceString", () => {
  it("should filter only valid amino acids by default", () => {
    const filteredString = filterAminoAcidSequenceString(
      'bbb342"""xtgalmfwkqespvicyhrnd,,../'
    );
    assert.equal(filteredString, "xtgalmfwkqespvicyhrnd");
  });
  it("should handle upper case letters", () => {
    const filteredString = filterAminoAcidSequenceString("xtgalmfWKQEspvicyhrnd");
    assert.equal(filteredString, "xtgalmfWKQEspvicyhrnd");
  });
  it("should handle the option to includeStopCodon by allowing periods", () => {
    const options = { includeStopCodon: true };
    const filteredString = filterAminoAcidSequenceString(
      'bbb342"""xtgalmfwkqespvicyhrnd,,../',
      options
    );
    assert.equal(filteredString, "xtgalmfwkqespvicyhrnd..");
  });
});
