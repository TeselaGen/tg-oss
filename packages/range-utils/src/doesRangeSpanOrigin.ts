import { Range } from "./types";

export default function doesRangeSpanOrigin(range: Range) {
  return range.start > range.end;
}
