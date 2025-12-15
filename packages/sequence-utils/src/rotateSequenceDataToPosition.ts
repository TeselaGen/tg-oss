import { map } from "lodash-es";
import { adjustRangeToRotation } from "@teselagen/range-utils";
import tidyUpSequenceData, {
  TidyUpSequenceDataOptions
} from "./tidyUpSequenceData";
import { modifiableTypes } from "./annotationTypes";
import rotateBpsToPosition from "./rotateBpsToPosition";
import { SequenceData, Annotation } from "./types";

export default function rotateSequenceDataToPosition(
  sequenceData: SequenceData,
  caretPosition: number,
  options: TidyUpSequenceDataOptions = {}
) {
  const newSequenceData = tidyUpSequenceData(sequenceData, {
    doNotRemoveInvalidChars: true,
    ...options
  });

  //update the sequence
  newSequenceData.sequence = rotateBpsToPosition(
    newSequenceData.sequence,
    caretPosition
  );

  //handle the insert
  modifiableTypes.forEach(annotationType => {
    //update the annotations:
    //handle the delete if necessary
    newSequenceData[annotationType] = adjustAnnotationsToRotation(
      newSequenceData[annotationType] as Annotation[],
      caretPosition,
      newSequenceData.sequence.length
    );
  });
  return newSequenceData;
}

function adjustAnnotationsToRotation(
  annotationsToBeAdjusted: Annotation[],
  positionToRotateTo: number,
  maxLength: number
) {
  return map(annotationsToBeAdjusted, annotation => {
    return {
      ...adjustRangeToRotation(annotation, positionToRotateTo, maxLength),
      locations: annotation.locations
        ? annotation.locations.map(location =>
            adjustRangeToRotation(location, positionToRotateTo, maxLength)
          )
        : undefined
    };
  }).filter(range => !!range); //filter any fully deleted ranges
}
