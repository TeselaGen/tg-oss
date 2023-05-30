const assert = require("assert");
const calculateTm = require("./calculateNebTm");

describe("calculate Tm based on SantaLucia 1998 & Owczarzy 2004", function() {
  it("should return the melting temperature of a given sequence, if no degenerate bases are present", function() {
    const options = {
      // 50 mM KCl in Q5 protocol
      monovalentCationConc: 0.05
    };
    // primer concentration in Q5 protocol is 500 nM
    assert.equal(
      calculateTm("AGCGGATAACAATTTCACACAGGA", 0.0000005, options),
      65.8994505801345
    );
    assert.equal(
      calculateTm("AGCGGATAACAATTTCAC", 0.0000005, options),
      56.11037835109477
    );
    assert.equal(
      calculateTm("AGCGGATAACAATTTcac", 0.0000005, options),
      56.11037835109477
    );
    assert.equal(
      calculateTm("AGCGGNNN", 0.0000005, options),
      "Error calculating Tm for sequence AGCGGNNN: Error: Degenerate bases prohibited in Tm calculation of sequence AGCGGNNN"
    );
    assert.equal(
      calculateTm("AGCGGnnn", 0.0000005, options),
      "Error calculating Tm for sequence AGCGGnnn: Error: Degenerate bases prohibited in Tm calculation of sequence AGCGGnnn"
    );
  });
});
