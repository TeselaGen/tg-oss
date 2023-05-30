const getAminoAcidDataForEachBaseOfDna = require("./getAminoAcidDataForEachBaseOfDna");

module.exports = function getAminoAcidStringFromSequenceString(sequenceString) {
  const aminoAcidsPerBase = getAminoAcidDataForEachBaseOfDna(
    sequenceString,
    true
  );
  const aaArray = [];
  let aaString = "";
  aminoAcidsPerBase.forEach(function(aa) {
    if (!aa.fullCodon) {
      return;
    }
    aaArray[aa.aminoAcidIndex] = aa.aminoAcid.value;
  });
  aaString = aaArray.join("");
  return aaString;
};
