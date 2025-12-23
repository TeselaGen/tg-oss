import getReverseComplementSequenceString from "./getReverseComplementSequenceString";
import getReverseComplementAnnotation from "./getReverseComplementAnnotation";
import { annotationTypes } from "./annotationTypes";
import { map } from "lodash-es";
import tidyUpSequenceData from "./tidyUpSequenceData";

import getSequenceDataBetweenRange from "./getSequenceDataBetweenRange";
import { SequenceData, Range, Annotation } from "./types";

export default function getReverseComplementSequenceAndAnnoations(
  pSeqObj: SequenceData,
  options: { range?: Range; [key: string]: unknown } = {}
): SequenceData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seqObj = tidyUpSequenceData(
    getSequenceDataBetweenRange(pSeqObj, options.range || null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { doNotRemoveInvalidChars: true, ...options } as any
  );
  const newSeqObj = Object.assign(
    {},
    seqObj,
    {
      sequence: getReverseComplementSequenceString(seqObj.sequence)
    },
    annotationTypes.reduce(
      (acc, type) => {
        if (seqObj[type]) {
          acc[type] = map(seqObj[type] as Annotation[], annotation => {
            return getReverseComplementAnnotation(
              annotation,
              seqObj.sequence.length
            );
          });
        }
        return acc;
      },
      {} as Record<string, Annotation[]>
    )
  );
  return tidyUpSequenceData(newSeqObj, {
    doNotRemoveInvalidChars: true,
    ...options
  });
}
