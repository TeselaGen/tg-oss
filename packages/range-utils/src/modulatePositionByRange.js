//this function takes a position that might not fit in a given range and puts it into that range
export default function modulatePositionByRange(position, range) {
  let returnVal = position;
  if (position < range.start) {
    returnVal = range.end - (range.start - (position + 1));
  } else if (position > range.end) {
    returnVal = range.start + (position - range.end - 1);
  }
  return returnVal;
}
