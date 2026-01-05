import { ANNOTATION_LABEL_FONT_WIDTH } from "./constants";
import { getWidth } from "./getXStartAndWidthOfRowAnnotation";

// Cache canvas context for text measurement
let measureCanvas;
export function getAnnotationTextWidth(
  text,
  fontSize = ANNOTATION_LABEL_FONT_WIDTH,
  fontFamily = "monospace"
) {
  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
  }
  const ctx = measureCanvas.getContext("2d");
  ctx.font = `${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
}

export const doesLabelFitInAnnotation = (
  text = "",
  { range, width },
  charWidth
) => {
  const textLength = getAnnotationTextWidth(text);
  const widthMinusOne =
    (range ? getWidth(range, charWidth, 0) : width) - charWidth;
  return widthMinusOne > textLength;
};

// export const getTruncatedLabel = (
//   text = "",
//   widthInBps,
// ) => {
//   const textLength = text.length * ANNOTATION_LABEL_FONT_WIDTH;
//   const widthMinusOne =
//     (range ? getWidth(range, charWidth, 0) : width) - charWidth;
//   const doesFit = widthMinusOne > textLength;
//   if (returnTextThatFits) {
//     if (doesFit) {
//       return text;
//     } else {
//       return text.slice(0, widthMinusOne);
//     }
//   } else {
//     return doesFit;
//   }
// };
