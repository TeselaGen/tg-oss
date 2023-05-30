var expandOrContractRangeByLength = require('./expandOrContractRangeByLength');
var isRangeWithinRange = require('./isRangeWithinRange');
var getOverlapsOfPotentiallyCircularRanges = require('./getOverlapsOfPotentiallyCircularRanges');
var translateRange = require('./translateRange');

var getRangeLength = require('./getRangeLength');
module.exports = function flipRelativeRange(innerRange, outerRange, sequenceLength, options) {
	var isFullyContained = isRangeWithinRange(innerRange,outerRange,sequenceLength)
	if (isFullyContained) {
		return flipFullyContainedRange(innerRange,outerRange,sequenceLength)
	}
	else {
		// flip not fully contained range
		return flipNonFullyContainedRange(innerRange,outerRange,sequenceLength)
	}
}

function flipNonFullyContainedRange(innerRange, outerRange, sequenceLength, options) {
	var outerFullyContained = isRangeWithinRange(outerRange, innerRange,sequenceLength)
	var flippedInnerRange
	if (outerFullyContained) {
		//special logic
		// flipFullyContainedRange(outerRange, outerRange, sequenceLength)
		var expandBy1 = getRangeLength({
					start: innerRange.start,
					end: outerRange.start
				},sequenceLength) - 1
		flippedInnerRange = expandOrContractRangeByLength(outerRange, expandBy1, false, sequenceLength)

		var expandBy2 = getRangeLength({
					end: innerRange.end,
					start: outerRange.end
				},sequenceLength) - 1
		flippedInnerRange = expandOrContractRangeByLength(flippedInnerRange, expandBy2, true, sequenceLength)
	} else {
		//find overlaps of ranges
		var overlaps = getOverlapsOfPotentiallyCircularRanges(innerRange, outerRange, sequenceLength)
		//take first overlap and determine which end of outer range it overlaps
		if (overlaps.length >= 1) {
			var overlapExtendsForward
			var firstOverlap = overlaps[0]
			overlapExtendsForward = firstOverlap.start !== outerRange.start
			//flip using fully contained logic
			var flippedTruncatedInner = flipFullyContainedRange(firstOverlap, outerRange, sequenceLength)
			//extend in the opposite direction
			var lengthToExtend = getRangeLength(innerRange,sequenceLength) - getRangeLength(flippedTruncatedInner, sequenceLength)
			flippedInnerRange = expandOrContractRangeByLength(flippedTruncatedInner, lengthToExtend, overlapExtendsForward, sequenceLength)
		} else {
			throw new Error('This case (relative ranges that do not overlap) is unsupported! ')
		}
	}
	return flippedInnerRange
}

function flipFullyContainedRange(innerRange, outerRange, sequenceLength, options) {
	//translate both ranges by offset such that outer range start = 0
	var translateBy = -outerRange.start
	var translatedOuterRange = translateRange(outerRange, translateBy, sequenceLength)
	var translatedInnerRange = translateRange(innerRange, translateBy, sequenceLength)

	//flip like non origin spanning range 
	var translatedFlippedInnerRange = flipNonOriginSpanningContainedRange(translatedInnerRange, translatedOuterRange, sequenceLength)

	//translate inner range back by negative offset 
	var flippedInnerRange = translateRange(translatedFlippedInnerRange, -translateBy, sequenceLength)
	return flippedInnerRange
}

function flipNonOriginSpanningContainedRange(innerRange, outerRange, sequenceLength) {
    //non origin spanning, fully contained inner
    var offsetFromStart = innerRange.start - outerRange.start
    var newInnerEnd = outerRange.end - offsetFromStart
		var innerRangeLength = getRangeLength(innerRange, sequenceLength)

    return {
		end: newInnerEnd,
		start: newInnerEnd - (innerRangeLength -1)
    }
}




//take 2

