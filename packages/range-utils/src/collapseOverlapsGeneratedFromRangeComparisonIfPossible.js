

//this function is a little confusing, but basically it takes an array of overlaps 
//generated from a range overlaps calculation, and it sews them together if possible
module.exports = function collapseOverlapsGeneratedFromRangeComparisonIfPossible(overlaps, sequenceLength, optionalOriginalRange) {
    const originalRangeLinear = optionalOriginalRange && (optionalOriginalRange.start <= optionalOriginalRange.end)
    if (overlaps.length === 1 || overlaps.length === 0) {
        return overlaps;
    } else if (overlaps.length === 2) {
        if (overlaps[0].start === 0 && overlaps[1].end + 1 === sequenceLength && !originalRangeLinear) {
            return [{
                start: overlaps[1].start,
                end: overlaps[0].end
            }];
        } else if (overlaps[1].start === 0 && overlaps[0].end + 1 === sequenceLength && !originalRangeLinear) {
            return [{
                start: overlaps[0].start,
                end: overlaps[1].end
            }];
        } else {
            return overlaps;
        }
    } else if (overlaps.length === 3) {
        const firstOverlap = overlaps[0];
        const secondOverlap = overlaps[1];
        const thirdOverlap = overlaps[2];
        let collapsedOverlaps = collapseOverlapsGeneratedFromRangeComparisonIfPossible([firstOverlap, secondOverlap], sequenceLength, optionalOriginalRange);
        if (collapsedOverlaps.length === 1) {
            collapsedOverlaps.push(thirdOverlap);
            return collapsedOverlaps;
        } else {
            collapsedOverlaps = collapseOverlapsGeneratedFromRangeComparisonIfPossible([firstOverlap, thirdOverlap], sequenceLength, optionalOriginalRange);
            if (collapsedOverlaps.length === 1) {
                collapsedOverlaps.push(secondOverlap);
                return collapsedOverlaps;
            } else {
                collapsedOverlaps = collapseOverlapsGeneratedFromRangeComparisonIfPossible([secondOverlap, thirdOverlap], sequenceLength, optionalOriginalRange);
                if (collapsedOverlaps.length === 1) {
                    collapsedOverlaps.push(firstOverlap);
                    return collapsedOverlaps;
                } else {
                    return overlaps;
                }
            }
        }
    }
};