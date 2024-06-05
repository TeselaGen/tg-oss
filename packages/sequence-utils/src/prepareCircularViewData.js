import { cloneDeep } from "lodash-es";
import { getYOffsetsForPotentiallyCircularRanges } from "@teselagen/range-utils";
import { annotationTypes } from "./annotationTypes";

//basically just adds yOffsets to the annotations
export default function prepareCircularViewData(sequenceData) {
  const clonedSeqData = cloneDeep(sequenceData);
  annotationTypes.forEach(annotationType => {
    if (annotationType !== "cutsites") {
      const maxYOffset = getYOffsetsForPotentiallyCircularRanges(
        clonedSeqData[annotationType]
      ).maxYOffset;
      clonedSeqData[annotationType].maxYOffset = maxYOffset;
    }
  });
  return clonedSeqData;
}
