var normalizePositionByRangeLength = require('./normalizePositionByRangeLength');

module.exports = function generateRandomRange(minStart, maxEnd, maxLength) {
	var start = getRandomInt(minStart, maxEnd); 
	var end
	if (maxLength) {
		end = normalizePositionByRangeLength(getRandomInt(start, start + maxLength), maxEnd)
	} else {
		end = getRandomInt(minStart, maxEnd); 
	}
	return {
		start: start,
		end: end,
	}
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
