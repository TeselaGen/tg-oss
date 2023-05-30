import {modifiableTypes} from "./annotationTypes";
import adjustAnnotationsToInsert from "./adjustAnnotationsToInsert";

export default function shiftAnnotationsByLen({
  seqData,
  caretPosition,
  insertLength
}) {
  modifiableTypes.forEach(annotationType => {
    const existingAnnotations = seqData[annotationType];
    seqData[annotationType] = adjustAnnotationsToInsert(
      existingAnnotations,
      caretPosition,
      insertLength
    );
  });
};
