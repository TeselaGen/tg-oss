const getReverseComplementSequenceString = require("./getReverseComplementSequenceString");
const getReverseComplementAnnotation = require("./getReverseComplementAnnotation");
const annotationTypes = require("./annotationTypes");
const { map } = require("lodash");
const tidyUpSequenceData = require("./tidyUpSequenceData");
// const ac = require('ve-api-check');
const getSequenceDataBetweenRange = require("./getSequenceDataBetweenRange");

// ac.throw([ac.string,ac.bool],arguments);
module.exports = function getReverseComplementSequenceAndAnnoations(
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
    annotationTypes.reduce(function(acc, type) {
      if (seqObj[type]) {
        acc[type] = map(seqObj[type], function(annotation) {
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
