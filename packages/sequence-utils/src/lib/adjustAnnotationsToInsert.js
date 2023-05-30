import {adjustRangeToInsert} from "@teselagen/range-utils";
import {map} from "lodash";

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
};
