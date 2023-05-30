import {assign} from "lodash";
import normalizePositionByRangeLength from './normalizePositionByRangeLength';

export default function translateRange(rangeToBeAdjusted, translateBy, rangeLength) {
    return assign({}, rangeToBeAdjusted, {
        start: normalizePositionByRangeLength(rangeToBeAdjusted.start + translateBy, rangeLength),
        end: normalizePositionByRangeLength(rangeToBeAdjusted.end + translateBy, rangeLength)
    });
};