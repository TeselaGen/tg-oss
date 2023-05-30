import calculateTm from "./calculateTm";
import assert from "assert";
describe("calculateTm", () => {
  it("should calculate the correct tm", () => {
    assert.equal(calculateTm("atagagaggga"), 26.21);
  });
});
