var convertRangeIndices = require('./convertRangeIndices');
module.exports = function convertRangeTo1Based (range) {
  return convertRangeIndices(range, {}, {inclusive1BasedStart: true, inclusive1BasedEnd: true})
}