export default function getPositionFromAngle(
  angle: number,
  rangeMax: number,
  isInBetweenPositions?: boolean
) {
  //percent through sequence * rangeMax
  const unroundedPostion = (angle / Math.PI / 2) * rangeMax;
  //return either the nearest position, or the nearest "inBetween" postion
  return isInBetweenPositions
    ? Math.round(unroundedPostion)
    : Math.floor(unroundedPostion);
}
