const { map } = require("lodash");
const { adjustRangeToRotation } = require("@teselagen/range-utils");
const tidyUpSequenceData = require("./tidyUpSequenceData");
const modifiableTypes = require("./annotationTypes").modifiableTypes;
const rotateBpsToPosition = require("./rotateBpsToPosition");

module.exports = function rotateSequenceDataToPosition(
  sequenceData,
  caretPosition,
  options
) {
  const newSequenceData = tidyUpSequenceData(sequenceData, options);

  //update the sequence
  newSequenceData.sequence = rotateBpsToPosition(
    newSequenceData.sequence,
    caretPosition
  );

  //handle the insert
  modifiableTypes.forEach(annotationType => {
    //update the annotations:
    //handle the delete if necessary
    newSequenceData[annotationType] = adjustAnnotationsToRotation(
      newSequenceData[annotationType],
      caretPosition,
      newSequenceData.sequence.length
    );
  });
  return newSequenceData;
};

function adjustAnnotationsToRotation(
  annotationsToBeAdjusted,
  positionToRotateTo,
  maxLength
) {
  return map(annotationsToBeAdjusted, function(annotation) {
    return {
      ...adjustRangeToRotation(annotation, positionToRotateTo, maxLength),
      locations: annotation.locations
        ? annotation.locations.map(location =>
            adjustRangeToRotation(location, positionToRotateTo, maxLength)
          )
        : undefined
    };
  }).filter(range => !!range); //filter any fully deleted ranges
}
