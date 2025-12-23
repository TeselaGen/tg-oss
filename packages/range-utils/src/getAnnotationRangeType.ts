import { Range } from "./types";

//function that returns the annotation range type
export default function getAnnotationRangeType(
  annotationRange: Range,
  enclosingRangeType: Range,
  forward: boolean
) {
  if (annotationRange.start === enclosingRangeType.start) {
    if (annotationRange.end === enclosingRangeType.end) {
      return "beginningAndEnd";
    } else {
      if (forward) {
        return "start";
      } else {
        return "end";
      }
    }
  } else {
    if (annotationRange.end === enclosingRangeType.end) {
      if (forward) {
        return "end";
      } else {
        return "start";
      }
    } else {
      return "middle";
    }
  }
}
