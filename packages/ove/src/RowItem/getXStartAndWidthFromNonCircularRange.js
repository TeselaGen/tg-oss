import { getRangeLength } from "@teselagen-biotech/range-utils";

export default function getXStartAndWidthFromNonCircularRange(
  range,
  charWidth
) {
  const rangeLength = getRangeLength(range);
  return {
    width: rangeLength * charWidth,
    xStart: range.start * charWidth
  };
}
