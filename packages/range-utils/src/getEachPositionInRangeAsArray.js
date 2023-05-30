var normalizePositionByRangeLength = require('./normalizePositionByRangeLength');
var getRangeLength = require('./getRangeLength');
module.exports = function getEachPositionInRangeAsArray(range, rangeMax) {
    var output = []
    var length = getRangeLength(range, rangeMax)
    if (!(length > 0)) {
    	return output
    }
    for (var i = range.start; i < (length + range.start); i++) {
        var position = normalizePositionByRangeLength(i, rangeMax)
        output.push(position)
    }    
    return output
}
