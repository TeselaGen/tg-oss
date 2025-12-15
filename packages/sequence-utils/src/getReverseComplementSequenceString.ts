import DNAComplementMap from "./DNAComplementMap";

// ac.throw([ac.string,ac.bool],arguments);
export default function getReverseComplementSequenceString(
  sequence: string
): string {
  // ac.throw([ac.string],arguments);
  let reverseComplementSequenceString = "";
  for (let i = sequence.length - 1; i >= 0; i--) {
    let revChar = (DNAComplementMap as Record<string, string>)[sequence[i]];
    if (!revChar) {
      revChar = sequence[i];
      // throw new Error('trying to get the reverse compelement of an invalid base');
    }
    reverseComplementSequenceString += revChar;
  }
  return reverseComplementSequenceString;
}
