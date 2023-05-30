var {clone} = require('lodash');
var normalizeRange = require('./normalizeRange');
module.exports = function expandOrContractRangeByLength(range, shiftBy, shiftStart, sequenceLength) {
    var rangeToReturn = clone(range)
    if (shiftStart) {
    	rangeToReturn.start -=shiftBy
    } else {
    	rangeToReturn.end +=shiftBy
    }
    return normalizeRange(rangeToReturn,sequenceLength)
}