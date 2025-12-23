import { adjustRangeToInsert } from "@teselagen/range-utils";
import { map } from "lodash-es";
import { Annotation } from "./types";

export default function adjustAnnotationsToInsert(
  annotationsToBeAdjusted: Record<string, Annotation> | Annotation[],
  insertStart: number,
  insertLength: number
) {
  return map(annotationsToBeAdjusted, (annotation: Annotation) => {
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
