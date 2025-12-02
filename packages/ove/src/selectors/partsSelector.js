import { createSelector } from "reselect";
import sequenceDataSelector from "./sequenceDataSelector";

import temporaryAnnotationsSelector from "./temporaryAnnotationsSelector";

function partsRawSelector(sequenceData, temporaryAnnotations) {
  return { ...sequenceData.parts, ...temporaryAnnotations?.parts };
}

export default createSelector(
  sequenceDataSelector,
  temporaryAnnotationsSelector,
  partsRawSelector
);
