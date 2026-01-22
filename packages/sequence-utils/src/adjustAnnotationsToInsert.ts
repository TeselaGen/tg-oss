import { adjustRangeToInsert } from "@teselagen/range-utils";
import { Annotation } from "./types";

export default function adjustAnnotationsToInsert(
  annotationsToBeAdjusted: Record<string, Annotation> | Annotation[],
  insertStart: number,
  insertLength: number
): Annotation[] {
  const annotations = Array.isArray(annotationsToBeAdjusted)
    ? annotationsToBeAdjusted
    : Object.values(annotationsToBeAdjusted);
  return annotations.map((annotation: Annotation) => {
    return {
      ...adjustRangeToInsert(annotation, insertStart, insertLength),
      ...(annotation.locations && {
        locations: annotation.locations.map((loc: Annotation) =>
          adjustRangeToInsert(loc, insertStart, insertLength)
        )
      })
    };
  });
}
