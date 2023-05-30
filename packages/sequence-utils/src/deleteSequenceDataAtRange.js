const insertSequenceDataAtPositionOrRange = require("./insertSequenceDataAtPositionOrRange");
module.exports = function deleteSequenceDataAtRange(sequenceData, range) {
  return insertSequenceDataAtPositionOrRange({}, sequenceData, range);
};
