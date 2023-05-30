const normalizePositionByRangeLength = require('./normalizePositionByRangeLength');
const provideInclusiveOptions = require('./provideInclusiveOptions')
module.exports = provideInclusiveOptions(invertRange)
function invertRange(rangeOrCaret, rangeMax) {
	if (rangeOrCaret.start > -1) {
	    const start = rangeOrCaret.end + 1;
	    const end = rangeOrCaret.start - 1;
	    return {
	        start: normalizePositionByRangeLength(start, rangeMax, false),
	        end: normalizePositionByRangeLength(end, rangeMax, false),
	    }
	} else {
		if (rangeOrCaret > -1) {
			return {
		        start: normalizePositionByRangeLength(rangeOrCaret, rangeMax, false),
		        end: normalizePositionByRangeLength(rangeOrCaret-1, rangeMax, false),
		    }
		}
	}
}
