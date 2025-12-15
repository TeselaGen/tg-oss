import getAminoAcidDataForEachBaseOfDna from "./getAminoAcidDataForEachBaseOfDna";
import { AminoAcidData } from "./types";

export default function getAminoAcidStringFromSequenceString(
  sequenceString: string,
  options: { doNotExcludeAsterisk?: boolean } = {}
): string {
  const { doNotExcludeAsterisk } = options;
  const aminoAcidsPerBase = getAminoAcidDataForEachBaseOfDna(
    sequenceString,
    true,
    null,
    false
  );
  const aaArray: string[] = [];
  let aaString = "";
  aminoAcidsPerBase.forEach((aa: AminoAcidData, index: number) => {
    if (!aa.fullCodon) {
      return;
    }
    // Check if the current amino acid is the last in the sequence and is a stop codon
    if (
      !doNotExcludeAsterisk &&
      index >= aminoAcidsPerBase.length - 3 &&
      aa.aminoAcid?.value === "*"
    ) {
      return;
    }
    if (aa.aminoAcidIndex === null || !aa.aminoAcid) {
      return;
    }
    aaArray[aa.aminoAcidIndex] = aa.aminoAcid.value;
  });
  aaString = aaArray.join("");
  return aaString;
}
