import threeLetterSequenceStringToAminoAcidMap from "./threeLetterSequenceStringToAminoAcidMap";
import proteinAlphabet from "./proteinAlphabet";
import degenerateDnaToAminoAcidMap from "./degenerateDnaToAminoAcidMap";

//tnrtodo: expand the threeLetterSequenceStringToAminoAcidMap mappings to include RNA characters.
//currently stop bps aren't all mapped!
export default function getAminoAcidFromSequenceTriplet(
  sequenceString: string
) {
  sequenceString = sequenceString.toLowerCase();
  if (sequenceString.length !== 3) {
    throw new Error("must pass a string of length 3");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aa = (threeLetterSequenceStringToAminoAcidMap as any)[sequenceString];
  if (aa) {
    return aa;
  }
  const letter =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (degenerateDnaToAminoAcidMap as any)[
      sequenceString.replace("x", "n") //replace x's with n's as those are equivalent dna chars
    ] || "x";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (proteinAlphabet as any)[letter.toUpperCase()];
}
