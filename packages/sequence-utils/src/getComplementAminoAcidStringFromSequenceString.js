var getAminoAcidStringFromSequenceString = require("./getAminoAcidStringFromSequenceString");

module.exports = function getComplementAminoAcidStringFromSequenceString(
  sequenceString
) {
  var aaString = getAminoAcidStringFromSequenceString(sequenceString, true);
  return aaString
    .split("")
    .reverse()
    .join("");
};
