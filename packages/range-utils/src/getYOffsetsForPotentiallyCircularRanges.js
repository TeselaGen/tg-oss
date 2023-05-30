const getYOffsetForPotentiallyCircularRange = require('./getYOffsetForPotentiallyCircularRange');
module.exports = function getYOffsetsForPotentiallyCircularRanges(ranges, assignYOffsetToRange) {
    //adjust the yOffset of the range being pushed in by checking its range against other ranges already in the row
    const yOffsets = [];
    let maxYOffset = 0;
    const yOffsetLevels = [] //yOffsetLevels is an array of arrays (array of yOffset levels holding arrays of ranges)
    ranges.forEach(function(range){
        //loop through y offset levels starting with the 0 level until an empty one is found and push the range into it. If none are found, add another level.
        const yOffset = getYOffsetForPotentiallyCircularRange(range, yOffsetLevels, assignYOffsetToRange)
        yOffsets.push(yOffset)
        if (yOffset>maxYOffset) {
            maxYOffset = yOffset;
        }
        range.yOffset = yOffset;
        if (!yOffsetLevels[yOffset]) yOffsetLevels[yOffset] = [];
        yOffsetLevels[yOffset].push(range);
    });
    return {yOffsets:yOffsets, maxYOffset: maxYOffset};
}
