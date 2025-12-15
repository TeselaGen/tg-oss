import calculateTm from "./calculateTm";
import assert from "assert";
describe("calculateTm", () => {
  it("should calculate the correct tm", () => {
    assert.equal(calculateTm("atagagaggga"), 26.211404758492115);
    assert.equal(calculateTm("AGCGGATAACAATTTCACACAGGA"), 67.27154960706082);
    assert.equal(calculateTm("AGCGGATAACAATTTCAC"), 54.91103113095034);
    assert.equal(calculateTm("AGCGGATAACAATTTcac"), 54.91103113095034);
    assert.equal(calculateTm("ataataccgcgccacatagc"), 63.51394755261396);
    assert.equal(calculateTm("AGCGGNNN"), -5.0392194500109255);
    assert.equal(calculateTm("AGCGGnnn"), -5.0392194500109255);
  });
});
