import getAminoAcidStringFromSequenceString from "./getAminoAcidStringFromSequenceString";

export default function getComplementAminoAcidStringFromSequenceString(
  sequenceString
) {
  const aaString = getAminoAcidStringFromSequenceString(sequenceString, true);
  return aaString.split("").reverse().join("");
}
