import { cloneDeep } from "lodash-es";
import { getYOffsetsForPotentiallyCircularRanges } from "@teselagen/range-utils";
import { annotationTypes } from "./annotationTypes";
import { SequenceData, Annotation } from "./types";

//basically just adds yOffsets to the annotations
export default function prepareCircularViewData(sequenceData: SequenceData) {
  const clonedSeqData = cloneDeep(sequenceData);
  annotationTypes.forEach(annotationType => {
    if (annotationType !== "cutsites") {
      const annotations = clonedSeqData[annotationType] as Annotation[];
      if (annotations) {
        const maxYOffset = getYOffsetsForPotentiallyCircularRanges(
          annotations,
          true
        ).maxYOffset;
        (
          clonedSeqData[annotationType] as Annotation[] & { maxYOffset: number }
        ).maxYOffset = maxYOffset;
      }
    }
  });
  return clonedSeqData;
}
