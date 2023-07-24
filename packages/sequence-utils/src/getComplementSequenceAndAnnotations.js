import getComplementSequenceString from "./getComplementSequenceString";
import tidyUpSequenceData from "./tidyUpSequenceData";


import getSequenceDataBetweenRange from "./getSequenceDataBetweenRange";

// ac.throw([ac.string,ac.bool],arguments);
export default function getComplementSequenceAndAnnotations(
  pSeqObj,
  options = {}
) {
  const seqObj = tidyUpSequenceData(
    getSequenceDataBetweenRange(pSeqObj, options.range),
    options
  );
  const newSeqObj = Object.assign({}, seqObj, {
    sequence: getComplementSequenceString(seqObj.sequence, seqObj.isRna)
  });
  return tidyUpSequenceData(newSeqObj, options);
};
