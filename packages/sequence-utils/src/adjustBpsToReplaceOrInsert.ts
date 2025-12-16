import {
  splitRangeIntoTwoPartsIfItIsCircular,
  getSequenceWithinRange,
  getRangeLength,
  invertRange,
  isPositionWithinRange,
  Range
} from "@teselagen/range-utils";

export default function adjustBpsToReplaceOrInsert(
  bpString: string,
  insertString = "",
  caretPositionOrRange: number | Range
) {
  let stringToReturn = bpString;

  if (
    typeof caretPositionOrRange !== "number" &&
    caretPositionOrRange &&
    caretPositionOrRange.start > -1
  ) {
    if (
      getRangeLength(caretPositionOrRange, bpString.length) === bpString.length
    ) {
      return insertString;
    }
    const ranges = splitRangeIntoTwoPartsIfItIsCircular(
      invertRange(
        caretPositionOrRange as unknown as Range,
        bpString.length
      ) as Range,
      bpString.length
    );
    stringToReturn = "";
    ranges.forEach((range, index) => {
      stringToReturn += getSequenceWithinRange(range, bpString);
      if (ranges.length === 1) {
        if (isPositionWithinRange(0, range, bpString.length, true, true)) {
          stringToReturn = stringToReturn + insertString;
        } else {
          stringToReturn = insertString + stringToReturn;
        }
      } else {
        if (index === 0) stringToReturn += insertString;
      }
    });
  } else {
    //caretPosition Passed
    stringToReturn = spliceString(
      bpString,
      caretPositionOrRange as number,
      0,
      insertString
    );
  }
  return stringToReturn;
}

const spliceString = (
  str: string,
  index: number,
  count: number,
  add: string
) => {
  let i = index;
  if (i < 0) {
    i = str.length + i;
    if (i < 0) {
      i = 0;
    }
  }
  return str.slice(0, i) + (add || "") + str.slice(i + count);
};
