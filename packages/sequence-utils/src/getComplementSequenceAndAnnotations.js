const getComplementSequenceString = require("./getComplementSequenceString");
const tidyUpSequenceData = require("./tidyUpSequenceData");
// const ac = require('ve-api-check');
const getSequenceDataBetweenRange = require("./getSequenceDataBetweenRange");

// ac.throw([ac.string,ac.bool],arguments);
module.exports = function getComplementSequenceAndAnnotations(
  pSeqObj,
  options = {}
) {
  const seqObj = tidyUpSequenceData(
    getSequenceDataBetweenRange(pSeqObj, options.range),
    options
  );
  const newSeqObj = Object.assign({}, seqObj, {
    sequence: getComplementSequenceString(seqObj.sequence)
  });
  return tidyUpSequenceData(newSeqObj, options);
};
