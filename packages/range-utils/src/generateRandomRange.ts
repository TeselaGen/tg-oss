import normalizePositionByRangeLength from "./normalizePositionByRangeLength";

export default function generateRandomRange(
  minStart: number,
  maxEnd: number,
  maxLength: number
) {
  const start = getRandomInt(minStart, maxEnd);
  let end;
  if (maxLength) {
    end = normalizePositionByRangeLength(
      getRandomInt(start, start + maxLength),
      maxEnd
    );
  } else {
    end = getRandomInt(minStart, maxEnd);
  }
  return {
    start: start,
    end: end
  };
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}
