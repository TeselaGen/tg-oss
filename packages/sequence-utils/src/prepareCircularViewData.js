const { cloneDeep } = require("lodash");
const { getYOffsetsForPotentiallyCircularRanges } = require("@teselagen/range-utils");
const annotationTypes = require("./annotationTypes");
//basically just adds yOffsets to the annotations
module.exports = function prepareCircularViewData(sequenceData) {
  var clonedSeqData = cloneDeep(sequenceData);
  annotationTypes.forEach(function(annotationType) {
    if (annotationType !== "cutsites") {
      var maxYOffset = getYOffsetsForPotentiallyCircularRanges(
        clonedSeqData[annotationType]
      ).maxYOffset;
      clonedSeqData[annotationType].maxYOffset = maxYOffset;
    }
  });
  return clonedSeqData;
};
