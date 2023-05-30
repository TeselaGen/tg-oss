const threeLetterSequenceStringToAminoAcidMap = require("./threeLetterSequenceStringToAminoAcidMap");
const proteinAlphabet = require("./proteinAlphabet");
const degenerateDnaToAminoAcidMap = require("./degenerateDnaToAminoAcidMap");

//tnrtodo: expand the threeLetterSequenceStringToAminoAcidMap mappings to include RNA characters.
//currently stop bps aren't all mapped!
module.exports = function getAminoAcidFromSequenceTriplet(sequenceString) {
  sequenceString = sequenceString.toLowerCase();
  if (sequenceString.length !== 3) {
    throw new Error("must pass a string of length 3");
  }
  let aa = threeLetterSequenceStringToAminoAcidMap[sequenceString];
  if (aa) {
    return aa;
  }
  const letter =
    degenerateDnaToAminoAcidMap[
      sequenceString.replace("x", "n") //replace x's with n's as those are equivalent dna chars
    ] || "x";

  return proteinAlphabet[letter.toUpperCase()];
};
