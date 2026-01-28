import getAminoAcidStringFromSequenceString from "./getAminoAcidStringFromSequenceString";

export default function getComplementAminoAcidStringFromSequenceString(
  sequenceString: string
): string {
  const aaString = getAminoAcidStringFromSequenceString(sequenceString, {
    doNotExcludeAsterisk: true
  });
  return aaString.split("").reverse().join("");
}
