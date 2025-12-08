import assert from "assert";
import calculateNebTm from "./calculateNebTm";
// import calculateTm from "./calculateTm";

describe("calculate Tm based on SantaLucia 1998 & Owczarzy 2004", () => {
  it("should return the melting temperature of a given sequence, if no degenerate bases are present", () => {
    const options = {
      // 50 mM KCl in Q5 protocol
      monovalentCationConc: 0.05,
      primerConc: 0.0000005
    };
    // console.log(`calculateNebTm("AGCGGATAACAATTTCACACAGGA", options),:`,calculateNebTm("AGCGGATAACAATTTCACACAGGA", options),)
    // console.log(`calculateTm("AGCGGATAACAATTTCACACAGGA", options),:`,calculateTm("AGCGGATAACAATTTCACACAGGA", options),)
    // console.log(`calculateTm("AGCGGATAnbACdAATTTCACACANNGGA", options),:`,calculateTm("AGCGGATAACAATTTCACACAGGA", options),)
    // primer concentration in Q5 protocol is 500 nM
    assert.equal(
      calculateNebTm("AGCGGATAACAATTTCACACAGGA", options),
      65.8994505801345
    );
    assert.equal(
      calculateNebTm("AGCGGATAACAATTTCAC", options),
      56.11037835109477
    );
    assert.equal(
      calculateNebTm("AGCGGATAACAATTTcac", options),
      56.11037835109477
    );
    assert.equal(
      calculateNebTm("ataataccgcgccacatagc", options),
      65.03019485849268
    );
    assert.equal(
      calculateNebTm("AGCGGNNN", options),
      "Error calculating Tm for sequence AGCGGNNN: Error: Degenerate bases prohibited in Tm calculation of sequence AGCGGNNN"
    );
    assert.equal(
      calculateNebTm("AGCGGnnn", options),
      "Error calculating Tm for sequence AGCGGnnn: Error: Degenerate bases prohibited in Tm calculation of sequence AGCGGnnn"
    );
  });
});
