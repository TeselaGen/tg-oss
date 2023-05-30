const checkIfPotentiallyCircularRangesOverlap = require('./checkIfPotentiallyCircularRangesOverlap');
module.exports = function getYOffsetForPotentiallyCircularRange(range, YOffsetLevelsWithRanges, assignYOffsetToRange) {
    //adjust the yOffset of the range being pushed in by checking its range against other range already in the row
    let yOffset = [];
    //YOffsetLevelsWithRanges is an array of arrays (array of yOffset levels holding arrays of range)
    //loop through y offset levels starting with the 0 level until an empty one is found and push the range into it. If none are found, add another level. 
    const openYOffsetFound = YOffsetLevelsWithRanges.some(function(rangesAlreadyAddedToYOffset, index) {
        const rangeBlocked = rangesAlreadyAddedToYOffset.some(function(comparisonRange) {
            return checkIfPotentiallyCircularRangesOverlap(range, comparisonRange)
        })
        if (!rangeBlocked) {
            yOffset = index
            if (assignYOffsetToRange) range.yOffset = index
            rangesAlreadyAddedToYOffset.push(range)
            return true
        }
    });
    if (!openYOffsetFound) {
        yOffset = YOffsetLevelsWithRanges.length
        if (assignYOffsetToRange) range.yOffset = YOffsetLevelsWithRanges.length
    }
    return yOffset
}