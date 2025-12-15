import { modifiableTypes } from "./annotationTypes";
import adjustAnnotationsToInsert from "./adjustAnnotationsToInsert";
import { SequenceData } from "./types";

export default function shiftAnnotationsByLen({
  seqData,
  caretPosition,
  insertLength
}: {
  seqData: SequenceData;
  caretPosition: number;
  insertLength: number;
}) {
  modifiableTypes.forEach(annotationType => {
    const existingAnnotations = seqData[annotationType];
    if (existingAnnotations) {
      seqData[annotationType] = adjustAnnotationsToInsert(
        existingAnnotations,
        caretPosition,
        insertLength
      );
    }
  });
}
