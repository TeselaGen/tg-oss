var modulatePositionByRange = require('./modulatePositionByRange');
module.exports = function normalizePositionByRangeLength1Based (position, sequenceLength) {
  return modulatePositionByRange(position, {start: 1, end: sequenceLength})
}