import expandOrContractCircularRangeToPosition from './expandOrContractCircularRangeToPosition';
import expandOrContractNonCircularRangeToPosition from './expandOrContractNonCircularRangeToPosition';

export default function expandOrContractRangeToPosition(range, position, maxLength) {
    if (range.start > range.end) {
        return expandOrContractCircularRangeToPosition(range, position, maxLength)
    } else {
        return expandOrContractNonCircularRangeToPosition(range, position, maxLength)
    }
};