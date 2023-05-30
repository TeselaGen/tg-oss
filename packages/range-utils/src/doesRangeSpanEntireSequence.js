import getRangeLength from './getRangeLength';

export default function doesRangeSpanEntireSequence (range, sequenceLength) {
  if (getRangeLength(range) === sequenceLength) {
  	return true
  }
};