const { modifiableTypes } = require("./annotationTypes");
const adjustAnnotationsToInsert = require("./adjustAnnotationsToInsert");

module.exports = function shiftAnnotationsByLen({
  seqData,
  caretPosition,
  insertLength
}) {
  modifiableTypes.forEach(annotationType => {
    const existingAnnotations = seqData[annotationType];
    seqData[annotationType] = adjustAnnotationsToInsert(
      existingAnnotations,
      caretPosition,
      insertLength
    );
  });
};
