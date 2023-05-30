const calculateTm = require("./calculateTm");
const assert = require("assert");
describe("calculateTm", function() {
  it("should calculate the correct tm", function() {
    assert.equal(calculateTm("atagagaggga"), 26.21);
  });
});
