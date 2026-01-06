import { createSelector } from "reselect";
import sequenceDataSelector from "./sequenceDataSelector";
import temporaryAnnotationsSelector from "./temporaryAnnotationsSelector";

function featuresRawSelector(sequenceData, temporaryAnnotations) {
  return { ...sequenceData.features, ...temporaryAnnotations?.features };
}

export default createSelector(
  sequenceDataSelector,
  temporaryAnnotationsSelector,
  featuresRawSelector
);
