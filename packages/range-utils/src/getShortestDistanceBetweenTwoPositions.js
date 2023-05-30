export default function getShortestDistanceBetweenTwoPositions(position1, position2, sequenceLength) {
  if (position1 < position2) {
	const position1Holder = position1;
  	position1 = position2
	position2 = position1Holder
  }
  //position 1 is now always >= position 2

  const d1 = position1 - position2;
  const d2 = sequenceLength - position1 + position2;
  return Math.min(d1,d2)
};
