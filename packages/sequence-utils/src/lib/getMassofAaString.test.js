import getMassOfAaString from "./getMassOfAaString";
import assert from "assert";

describe("getMassOfAaString", () => {
  it("an empty string has a mass of 0", () => {
    assert.equal(getMassOfAaString(""), 0);
  });
  it("A string with one amino acids returns the correct results", () => {
    assert.equal(getMassOfAaString("T"), 119.1);
    assert.equal(getMassOfAaString("A"), 89.1);
    assert.equal(getMassOfAaString("F"), 165.2);
  });
  it("A string a long string of amino acids returns the correct results", () => {
    assert.equal(getMassOfAaString("TAGATAFPFPFPA"), 1510.6);
    assert.equal(getMassOfAaString("TFPMAV"), 754.8);
    assert.equal(getMassOfAaString("TFPMAVTAGATAFPFPFPA"), 2265.4);
  });
});
