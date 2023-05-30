import convertRangeIndices from './convertRangeIndices';

export default function convertRangeTo0Based (range) {
  return convertRangeIndices(range, {inclusive1BasedStart: true, inclusive1BasedEnd: true})
};