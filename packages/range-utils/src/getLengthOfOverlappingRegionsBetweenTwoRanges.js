var getRangeLength = require('./getRangeLength');
var getOverlapsOfPotentiallyCircularRanges = require('./getOverlapsOfPotentiallyCircularRanges');
module.exports = function getLengthOfOverlappingRegionsBetweenTwoRanges(rangeA, rangeB, maxLength) {
    var overlaps = getOverlapsOfPotentiallyCircularRanges(rangeA,rangeB,maxLength)
    return overlaps.reduce(function (counter, overlap) {
        return counter + getRangeLength(overlap, maxLength)
    }, 0)
}