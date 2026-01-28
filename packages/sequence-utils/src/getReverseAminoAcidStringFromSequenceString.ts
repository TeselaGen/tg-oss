import getAminoAcidDataForEachBaseOfDna from "./getAminoAcidDataForEachBaseOfDna";

export default function getReverseAminoAcidStringFromSequenceString(
  sequenceString: string
) {
  const aminoAcidsPerBase = getAminoAcidDataForEachBaseOfDna(
    sequenceString,
    false,
    null,
    false
  );
  const aaArray: string[] = [];
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
