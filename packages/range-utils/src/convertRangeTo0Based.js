var convertRangeIndices = require('./convertRangeIndices');
module.exports = function convertRangeTo0Based (range) {
  return convertRangeIndices(range, {inclusive1BasedStart: true, inclusive1BasedEnd: true})
}