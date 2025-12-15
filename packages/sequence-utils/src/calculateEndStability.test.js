import assert from "assert";
import calculateEndStability from "./calculateEndStability";

describe("Calculate the stability of the primer ends.", () => {
  it("should return the end stability score of a given primer sequence", () => {
    assert.equal(calculateEndStability("AGCGGATAACAATTTCACACAGGA"), 3.89);
    assert.equal(calculateEndStability("AGCGGATAACAATTTCAC"), 3.24);
    assert.equal(calculateEndStability("AGCGGATAACAATTTcac"), 3.24);
    assert.equal(calculateEndStability("ataataccgcgccacatagc"), 2.99);
    assert.equal(calculateEndStability("AGCGGATAACAATACNNN"), 0.6);
    assert.equal(calculateEndStability("AGCGGATAACAATACnnn"), 0.6);
    assert.equal(
      calculateEndStability("AGCGGATAACAYZAKLPATAC"),
      "Error calculating end stability for sequence AGCGGATAACAYZAKLPATAC. Error: Invalid sequence: contains non-DNA characters"
    );
    assert.equal(
      calculateEndStability("AGCG"),
      "Error calculating end stability for sequence AGCG. Error: Sequence too short: minimum length is 5 bases for end stability calculation"
    );
  });
});
