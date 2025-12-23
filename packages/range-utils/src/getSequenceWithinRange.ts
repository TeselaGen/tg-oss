import { Range } from "./types";

// overload the function signatures so that TS knows what type to expect back (string or T[])
export default function getSequenceWithinRange(
  range: Range,
  sequence: string
): string;
export default function getSequenceWithinRange<T>(
  range: Range,
  sequence: T[]
): T[];
export default function getSequenceWithinRange<T>(
  range: Range,
  sequence: string | T[]
) {
  if (range.start < 0 || range.end < 0) {
    if (typeof sequence === "string") return "";
    return [];
  }
  if (range.start > range.end) {
    //circular range
    const subSequence = sequence.slice(range.start, sequence.length);
    if (typeof subSequence === "string") {
      return subSequence + sequence.slice(0, range.end + 1);
    } else {
      return (subSequence as T[]).concat(
        sequence.slice(0, range.end + 1) as T[]
      );
    }
  } else {
    return sequence.slice(range.start, range.end + 1);
  }
}
