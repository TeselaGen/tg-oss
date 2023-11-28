import getAminoAcidDataForEachBaseOfDna from "./getAminoAcidDataForEachBaseOfDna";

export default function getAminoAcidStringFromSequenceString(sequenceString) {
  const aminoAcidsPerBase = getAminoAcidDataForEachBaseOfDna(
    sequenceString,
    true
  );
  const aaArray = [];
  let aaString = "";
  aminoAcidsPerBase.forEach((aa, index) => {
    if (!aa.fullCodon) {
      return;
    }
    // Check if the current amino acid is the last in the sequence and is a stop codon
    if (index >= aminoAcidsPerBase.length - 3 && aa.aminoAcid.value === '*') {
      return;
    }
    aaArray[aa.aminoAcidIndex] = aa.aminoAcid.value;
  });
  aaString = aaArray.join("");
  return aaString;
}
