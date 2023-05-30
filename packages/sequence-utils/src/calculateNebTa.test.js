const assert = require("assert");
const calculateTa = require("./calculateNebTa");

describe("calculate Ta", function() {
  it("should return the annealing temperature of two primers based on Q5 protocol", function() {
    // primer concentration in Q5 protocol is 500 nM
    const primerConc = 0.0000005;
    const options = {
      // 50 mM KCl in Q5 protocol
      monovalentCationConc: 0.05,
      polymerase: "Q5"
    };

    const sequenceSet1 = ["AGCGGATAACAATTTCACACAGGA", "GTAAAACGACGGCCAGT"];
    assert.equal(
      calculateTa(sequenceSet1, primerConc, options),
      63.54033701264342
    );
    const sequenceSet2 = ["AGCGGATAAGGGCAATTTCAC", "GTAAAACGACGGCCA"];
    assert.equal(
      calculateTa(sequenceSet2, primerConc, options),
      59.95638912652805
    );
    const sequenceSet3 = [
      "AGCGGATAAGGGCAATTTCAC",
      "GTAAAACGACGGCCA",
      "AGCGGATAACAATTTCAC"
    ];
    assert.equal(
      calculateTa(sequenceSet3, primerConc, options),
      "Error calculating annealing temperature: Error: 3 sequences received when 2 primers were expected"
    );
    // "Annealing temperature for experiments with this enzyme should typically not exceed 72°C"
    const sequenceSet4 = [
      "CACACCAGGTCTCAGATATACATATGACAGACAAACCGGCCAAAGG",
      "CACACCAGGTCTCACTCCTTCTTAAATCATCGGGTCAGCACGTAGG"
    ];
    assert.equal(calculateTa(sequenceSet4, primerConc, options), 72);
  });

  it("should return the annealing temperature of two primers without a specified polymerase", function() {
    // primer concentration 500 nM
    const primerConc = 0.0000005;
    const options = {
      // 50 mM KCl
      monovalentCationConc: 0.05
    };
    const sequenceSet = [
      "CACACCAGGTCTCAGATATACATATGACAGACAAACCGGCCAAAGG",
      "CACACCAGGTCTCACTCCTTCTTAAATCATCGGGTCAGCACGTAGG"
    ];
    assert.equal(
      calculateTa(sequenceSet, primerConc, options),
      74.49383180968016
    );
  });
});
