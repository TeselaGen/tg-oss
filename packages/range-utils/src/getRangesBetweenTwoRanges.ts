import { Range } from "./types";

export default function getRangesBetweenTwoRanges(
  range1: Range,
  range2: Range
) {
  // {
  //     start: 85,
  //     end: 92
  // }

  // {
  //     start: 130,
  //     end: 189
  // }

  // start1 - end2

  // start2 - end1

  const newRanges: Range[] = [];
  if (
    !(
      range1.start > -1 &&
      range1.end > -1 &&
      range2.start > -1 &&
      range2.end > -1
    )
  ) {
    return newRanges;
  }
  return [
    {
      start: range1.start,
      end: range2.end
    },
    {
      start: range2.start,
      end: range1.end
    }
  ];
}
