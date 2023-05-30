const chai = require("chai");
chai.should();
const guessIfSequenceIsDnaAndNotProtein = require("./guessIfSequenceIsDnaAndNotProtein");
describe("guessIfSequenceIsDnaAndNotProtein", function() {
  it("should default to DNA for a length 0 sequecne", function() {
    guessIfSequenceIsDnaAndNotProtein("").should.equal(true);
  });
  it("should correctly guess that a DNA seq is DNA", function() {
    guessIfSequenceIsDnaAndNotProtein("gtatacc").should.equal(true);
  });
  it("should correctly guess that a DNA seq with some ambiguity is a DNA", function() {
    guessIfSequenceIsDnaAndNotProtein("gtatacctaacn").should.equal(true);
  });
  it("should correctly guess that a seq with lots of ambiguity is a protein when in the default strict mode", function() {
    guessIfSequenceIsDnaAndNotProtein("gtatacybctaacn", {
      loose: false
    }).should.equal(false);
  });
  it("should correctly guess that a seq with lots of ambiguity is dna when in the loose mode", function() {
    guessIfSequenceIsDnaAndNotProtein("gtatacybctaacn", {
      loose: true
    }).should.equal(true);
  });
  it("should correctly guess that a DNA with lots of ambiguities is dna when the threshold is lower  ", function() {
    guessIfSequenceIsDnaAndNotProtein("gtatacybctaacn", {
      threshold: 0.5
    }).should.equal(true);
  });
  it("should correctly guess that a DNA with lots of ambiguity is a dna when the ambiguous letter is included ", function() {
    guessIfSequenceIsDnaAndNotProtein("gtatanccnnntaacn", {
      dnaLetters: ["g", "a", "t", "c", "n"]
    }).should.equal(true);
  });
});
