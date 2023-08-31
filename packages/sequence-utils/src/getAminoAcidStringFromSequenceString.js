import getAminoAcidDataForEachBaseOfDna from "./getAminoAcidDataForEachBaseOfDna";

export default function getAminoAcidStringFromSequenceString(sequenceString) {
  const aminoAcidsPerBase = getAminoAcidDataForEachBaseOfDna(
    sequenceString,
    true
  );
  const aaArray = [];
  let aaString = "";
  aminoAcidsPerBase.forEach(aa => {
    if (!aa.fullCodon) {
      return;
    }
    aaArray[aa.aminoAcidIndex] = aa.aminoAcid.value;
  });
  aaString = aaArray.join("");
  return aaString;
}
