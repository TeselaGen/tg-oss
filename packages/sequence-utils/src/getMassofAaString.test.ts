import getMassOfAaString from "./getMassOfAaString";
import assert from "assert";

describe("getMassOfAaString", () => {
  it("an empty string has a mass of 0", () => {
    assert.equal(getMassOfAaString(""), 0);
  });
  it("string with one amino acid returns the correct results", () => {
    assert.equal(getMassOfAaString("T"), 119.12);
    assert.equal(getMassOfAaString("A"), 89.09);
    assert.equal(getMassOfAaString("F"), 165.19);
  });
  it("a long string of amino acids returns the correct results", () => {
    assert.equal(getMassOfAaString("TAGATAFPFPFPA"), 1294.45);
    assert.equal(getMassOfAaString("TFPMAV"), 664.81);
    assert.equal(getMassOfAaString("TFPMAVTAGATAFPFPFPA"), 1941.25);
    assert.equal(getMassOfAaString("ARNDCEQGHILKMFPSTWYV"), 2395.71);
  });
});
