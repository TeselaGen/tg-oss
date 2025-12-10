import getComplementSequenceString from "./getComplementSequenceString";

import assert from "assert";

describe("complement base should be shown correctly", () => {
  it("complement base should be shown correctly for RNA sequence", () => {
    assert.equal("UUA", getComplementSequenceString("AAU", true));
  });

  it("complement base should be shown correctly for DNA sequence", () => {
    assert.equal("TTA", getComplementSequenceString("AAT"));
  });
});
