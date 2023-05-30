var getRangeLength = require('./getRangeLength');
module.exports = function doesRangeSpanEntireSequence (range, sequenceLength) {
  if (getRangeLength(range) === sequenceLength) {
  	return true
  }
}