import { Range } from "./types";

//
export default function getSequenceWithinRange<T>(
  range: Range,
  sequence: string | T[]
) {
  // ac.throw([ac.range, ac.oneOfType([ac.array, ac.string])], arguments);
  if (range.start < 0 || range.end < 0) return "";
  if (range.start > range.end) {
    //circular range
    let subSequence = sequence.slice(range.start, sequence.length);
    if (typeof subSequence === "string") {
      subSequence += sequence.slice(0, range.end + 1);
    } else {
      subSequence = (subSequence as T[]).concat(
        sequence.slice(0, range.end + 1) as T[]
      );
    }
    return subSequence;
  } else {
    return sequence.slice(range.start, range.end + 1);
  }
}
