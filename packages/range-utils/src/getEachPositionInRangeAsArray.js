import normalizePositionByRangeLength from './normalizePositionByRangeLength';
import getRangeLength from './getRangeLength';

export default function getEachPositionInRangeAsArray(range, rangeMax) {
    const output = [];
    const length = getRangeLength(range, rangeMax);
    if (!(length > 0)) {
    	return output
    }
    for (let i = range.start; i < (length + range.start); i++) {
        const position = normalizePositionByRangeLength(i, rangeMax);
        output.push(position)
    }    
    return output
};
