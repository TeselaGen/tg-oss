import getComplementSequenceString from "./getComplementSequenceString";
import tidyUpSequenceData from "./tidyUpSequenceData";

import getSequenceDataBetweenRange from "./getSequenceDataBetweenRange";
import { SequenceData, Range } from "./types";

// ac.throw([ac.string,ac.bool],arguments);
export default function getComplementSequenceAndAnnotations(
  pSeqObj: SequenceData,
  options: { range?: Range; [key: string]: unknown } = {}
): SequenceData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seqObj = tidyUpSequenceData(
    getSequenceDataBetweenRange(pSeqObj, options.range || null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options as any
  );
  const newSeqObj = Object.assign({}, seqObj, {
    sequence: getComplementSequenceString(seqObj.sequence, seqObj.isRna)
  });
  return tidyUpSequenceData(newSeqObj, {
    doNotRemoveInvalidChars: true,
    ...options
  });
}
