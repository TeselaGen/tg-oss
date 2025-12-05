import convertRangeIndices from "./convertRangeIndices";
import { Range } from "./types";

export default function convertRangeTo0Based(range: Range) {
  return convertRangeIndices(range, {
    inclusive1BasedStart: true,
    inclusive1BasedEnd: true
  });
}
