import getReverseComplementSequenceString from "./getReverseComplementSequenceString";
import getReverseComplementAnnotation from "./getReverseComplementAnnotation";
import { annotationTypes } from "./annotationTypes";
import {map} from "lodash";
import tidyUpSequenceData from "./tidyUpSequenceData";


import getSequenceDataBetweenRange from "./getSequenceDataBetweenRange";

// ac.throw([ac.string,ac.bool],arguments);
export default function getReverseComplementSequenceAndAnnoations(
  pSeqObj,
  options = {}
) {
  const seqObj = tidyUpSequenceData(
    getSequenceDataBetweenRange(pSeqObj, options.range),
    options
  );
  const newSeqObj = Object.assign(
    {},
    seqObj,
    {
      sequence: getReverseComplementSequenceString(seqObj.sequence)
    },
    annotationTypes.reduce((acc, type) => {
      if (seqObj[type]) {
        acc[type] = map(seqObj[type], annotation => {
          return getReverseComplementAnnotation(
            annotation,
            seqObj.sequence.length
          );
        });
      }
      return acc;
    }, {})
  );
  return tidyUpSequenceData(newSeqObj, options);
};
