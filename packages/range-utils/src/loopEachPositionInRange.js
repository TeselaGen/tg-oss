var getEachPositionInRangeAsArray = require('./getEachPositionInRangeAsArray');
module.exports = function loopEachPositionInRange(range, rangeMax, func) {
    getEachPositionInRangeAsArray(range,rangeMax).map(func)
}
