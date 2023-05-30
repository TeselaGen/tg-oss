import getEachPositionInRangeAsArray from './getEachPositionInRangeAsArray';

export default function loopEachPositionInRange(range, rangeMax, func) {
    getEachPositionInRangeAsArray(range,rangeMax).map(func)
};
