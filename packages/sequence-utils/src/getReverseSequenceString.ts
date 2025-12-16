export default function getReverseSequenceString(sequence: string): string {
  let reverseSequenceString = "";
  for (let i = sequence.length - 1; i >= 0; i--) {
    let revChar = sequence[i];
    if (!revChar) {
      revChar = sequence[i];
      // throw new Error('trying to get the reverse of an invalid base');
    }
    reverseSequenceString += revChar;
  }
  return reverseSequenceString;
}
