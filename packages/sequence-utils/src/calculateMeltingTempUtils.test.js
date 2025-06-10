import assert from "assert";
import {
  breslauer1986Tm,
//   idtAllawi1997Tm,
  nebSantaLucia1998Tm,
//   rnaXia1998Tm,
  calculateNebTa
} from "./calculateMeltingTempUtils";

describe("calculate Ta", () => {
  it("should return the annealing temperature of two primers based on Q5 protocol", () => {
    // primer concentration in Q5 protocol is 500 nM
    const primerConc = 0.0000005;
    const options = {
      // 50 mM KCl in Q5 protocol
      monovalentCationConc: 0.05,
      polymerase: "Q5"
    };

    const sequenceSet1 = ["AGCGGATAACAATTTCACACAGGA", "GTAAAACGACGGCCAGT"];
    assert.equal(
      calculateNebTa(sequenceSet1, primerConc, options),
      63.54033701264342
    );
    const sequenceSet2 = ["AGCGGATAAGGGCAATTTCAC", "GTAAAACGACGGCCA"];
    assert.equal(
      calculateNebTa(sequenceSet2, primerConc, options),
      59.95638912652805
    );
    const sequenceSet3 = [
      "AGCGGATAAGGGCAATTTCAC",
      "GTAAAACGACGGCCA",
      "AGCGGATAACAATTTCAC"
    ];
    assert.equal(
      calculateNebTa(sequenceSet3, primerConc, options),
      "Error calculating annealing temperature: Error: 3 sequences received when 2 primers were expected"
    );
    // "Annealing temperature for experiments with this enzyme should typically not exceed 72°C"
    const sequenceSet4 = [
      "CACACCAGGTCTCAGATATACATATGACAGACAAACCGGCCAAAGG",
      "CACACCAGGTCTCACTCCTTCTTAAATCATCGGGTCAGCACGTAGG"
    ];
    assert.equal(calculateNebTa(sequenceSet4, primerConc, options), 72);
  });

  it("should return the annealing temperature of two primers without a specified polymerase", () => {
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
      calculateNebTa(sequenceSet, primerConc, options),
      74.49383180968016
    );
  });
});

describe("calculate Tm based on SantaLucia 1998 & Owczarzy 2004", () => {
  it("should return the melting temperature of a given sequence, if no degenerate bases are present", () => {
    const options = {
      // 50 mM KCl in Q5 protocol
      monovalentCationConc: 0.05,
      primerConc: 0.0000005
    };
    // console.log(`nebSantaLucia1998Tm("AGCGGATAACAATTTCACACAGGA", options),:`,nebSantaLucia1998Tm("AGCGGATAACAATTTCACACAGGA", options),)
    // console.log(`calculateTm("AGCGGATAACAATTTCACACAGGA", options),:`,calculateTm("AGCGGATAACAATTTCACACAGGA", options),)
    // console.log(`calculateTm("AGCGGATAnbACdAATTTCACACANNGGA", options),:`,calculateTm("AGCGGATAACAATTTCACACAGGA", options),)
    // primer concentration in Q5 protocol is 500 nM
    assert.equal(
      nebSantaLucia1998Tm("AGCGGATAACAATTTCACACAGGA", options),
      65.8994505801345
    );
    assert.equal(
      nebSantaLucia1998Tm("AGCGGATAACAATTTCAC", options),
      56.11037835109477
    );
    assert.equal(
      nebSantaLucia1998Tm("AGCGGATAACAATTTcac", options),
      56.11037835109477
    );
    assert.equal(
      nebSantaLucia1998Tm("ataataccgcgccacatagc", options),
      65.03019485849268
    );
    assert.equal(
      nebSantaLucia1998Tm("AGCGGNNN", options),
      "Error calculating Tm for sequence AGCGGNNN: Error: Degenerate bases prohibited in Tm calculation of sequence AGCGGNNN"
    );
    assert.equal(
      nebSantaLucia1998Tm("AGCGGnnn", options),
      "Error calculating Tm for sequence AGCGGnnn: Error: Degenerate bases prohibited in Tm calculation of sequence AGCGGnnn"
    );
  });
});

describe("breslauer1986Tm", () => {
  it("should calculate the correct tm", () => {
    assert.equal(breslauer1986Tm("atagagaggga"), 26.211404758492115);
    assert.equal(
      breslauer1986Tm("AGCGGATAACAATTTCACACAGGA"),
      67.27154960706082
    );
    assert.equal(breslauer1986Tm("AGCGGATAACAATTTCAC"), 54.91103113095034);
    assert.equal(breslauer1986Tm("AGCGGATAACAATTTcac"), 54.91103113095034);
    assert.equal(breslauer1986Tm("ataataccgcgccacatagc"), 63.51394755261396);
    assert.equal(breslauer1986Tm("AGCGGNNN"), -5.0392194500109255);
    assert.equal(breslauer1986Tm("AGCGGnnn"), -5.0392194500109255);
  });
});
