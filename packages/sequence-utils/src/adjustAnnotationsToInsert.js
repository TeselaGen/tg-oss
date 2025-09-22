import { adjustRangeToInsert } from "@teselagen-biotech/range-utils";
import { map } from "lodash-es";

export default function adjustAnnotationsToInsert(
  annotationsToBeAdjusted,
  insertStart,
  insertLength
) {
  return map(annotationsToBeAdjusted, annotation => {
    return {
      ...adjustRangeToInsert(annotation, insertStart, insertLength),
      ...(annotation.locations && {
        locations: annotation.locations.map(loc =>
          adjustRangeToInsert(loc, insertStart, insertLength)
        )
      })
    };
  });
}
