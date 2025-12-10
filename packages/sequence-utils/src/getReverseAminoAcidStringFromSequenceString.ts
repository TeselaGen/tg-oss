import getAminoAcidDataForEachBaseOfDna from "./getAminoAcidDataForEachBaseOfDna";

export default function getReverseAminoAcidStringFromSequenceString(
  sequenceString
) {
  const aminoAcidsPerBase = getAminoAcidDataForEachBaseOfDna(
    sequenceString,
    false
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
