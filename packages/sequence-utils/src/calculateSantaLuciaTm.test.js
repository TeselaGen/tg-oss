import assert from "assert";
import calculateSantaLuciaTm from "./calculateSantaLuciaTm";

describe("calculate Tm based on SantaLucia 1998", () => {
  it("should return the melting temperature of a given sequence, if no degenerate bases are present", () => {
    assert.equal(
      calculateSantaLuciaTm("AGCGGATAACAATTTCACACAGGA"),
      60.805947394707346
    );
    assert.equal(
      calculateSantaLuciaTm("AGCGGATAACAATTTCAC"),
      50.301642635069356
    );
    assert.equal(
      calculateSantaLuciaTm("AGCGGATAACAATTTcac"),
      50.301642635069356
    );
    assert.equal(
      calculateSantaLuciaTm("ataataccgcgccacatagc"),
      58.27798862992364
    );
    assert.equal(
      calculateSantaLuciaTm("AGCGGATAACAATACNNN"),
      40.92944342497407
    );
    assert.equal(
      calculateSantaLuciaTm("AGCGGATAACAATACnnn"),
      40.92944342497407
    );
    assert.equal(
      calculateSantaLuciaTm("AGCGGATAACAYZAKLPATAC"),
      "Error calculating Tm for sequence AGCGGATAACAYZAKLPATAC. Error: Invalid sequence: contains non-DNA characters"
    );
    assert.equal(
      calculateSantaLuciaTm("A"),
      "Error calculating Tm for sequence A. Error: Sequence too short: minimum length is 2 bases"
    );
  });
});
