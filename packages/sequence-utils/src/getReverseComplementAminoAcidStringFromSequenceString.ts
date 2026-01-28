import getAminoAcidStringFromSequenceString from "./getAminoAcidStringFromSequenceString";
import getReverseComplementSequenceString from "./getReverseComplementSequenceString";

export default function getReverseComplementAminoAcidStringFromSequenceString(
  sequenceString: string
): string {
  return getAminoAcidStringFromSequenceString(
    getReverseComplementSequenceString(sequenceString)
  );
}
