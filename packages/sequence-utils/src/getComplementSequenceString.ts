import DNAComplementMap from "./DNAComplementMap";
import { merge } from "lodash-es";

export default function getComplementSequenceString(
  sequence: string,
  isRna?: boolean
): string {
  if (typeof sequence !== "string") return "";
  let complementSeqString = "";
  const complementMap: Record<string, string> = merge(
    DNAComplementMap,
    isRna ? { a: "u", A: "U" } : { a: "t", A: "T" }
  );
  for (let i = 0; i < sequence.length; i++) {
    let complementChar = complementMap[sequence[i]];
    if (!complementChar) {
      complementChar = sequence[i];
      // throw new Error('trying to get the reverse compelement of an invalid base');
    }
    complementSeqString += complementChar;
  }
  return complementSeqString;
}
