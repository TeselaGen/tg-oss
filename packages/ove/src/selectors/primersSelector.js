import { createSelector } from "reselect";
import sequenceDataSelector from "./sequenceDataSelector";

import temporaryAnnotationsSelector from "./temporaryAnnotationsSelector";

function primersRawSelector(sequenceData, temporaryAnnotations) {
  return { ...sequenceData.primers, ...temporaryAnnotations?.primers };
}

export default createSelector(
  sequenceDataSelector,
  temporaryAnnotationsSelector,
  primersRawSelector
);
