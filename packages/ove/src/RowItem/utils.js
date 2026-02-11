import { ANNOTATION_LABEL_FONT_WIDTH } from "./constants";
import { getWidth } from "./getXStartAndWidthOfRowAnnotation";

// Cache canvas context and computed font size for text measurement
let measureCanvas;
let cachedFontSize = null;

/**
 * Get the computed font size for the ve-monospace-font class
 */
function getVeMonospaceFontSize() {
  if (cachedFontSize !== null) {
    return cachedFontSize;
  }

  // Create a temporary element to measure the computed font size
  const tempElement = document.createElement("div");
  tempElement.className = "ve-monospace-font";
  tempElement.style.position = "absolute";
  tempElement.style.visibility = "hidden";
  tempElement.style.pointerEvents = "none";
  document.body.appendChild(tempElement);

  try {
    const computedStyle = window.getComputedStyle(tempElement);
    const fontSize = parseFloat(computedStyle.fontSize);
    cachedFontSize = fontSize || ANNOTATION_LABEL_FONT_WIDTH; // fallback to 10px if parsing fails
    return cachedFontSize;
  } catch (error) {
    console.warn(
      "Failed to compute ve-monospace-font size, using fallback",
      error
    );
    cachedFontSize = ANNOTATION_LABEL_FONT_WIDTH; // fallback
    return cachedFontSize;
  } finally {
    document.body.removeChild(tempElement);
  }
}

export function getAnnotationTextWidth(text, fontFamily = "monospace") {
  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
  }
  const fontSize = getVeMonospaceFontSize();
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
  const fontSize = getVeMonospaceFontSize();
  const widthMinusOne = range
    ? getWidth(range, charWidth, 0) - fontSize * 2
    : width - fontSize * 2;
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
