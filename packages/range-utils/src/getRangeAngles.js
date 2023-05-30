const getRangeLength = require("./getRangeLength");

module.exports = function getRangeAngles(range, rangeMax) {
  const { startAngle, totalAngle, endAngle } = getStartEndAndTotalAngle(
    range,
    rangeMax
  );
  return {
    startAngle,
    totalAngle,
    endAngle,
    centerAngle: startAngle + totalAngle / 2,
    locationAngles:
      range.locations &&
      range.locations.map((location) => {
        return getRangeAngles(location, rangeMax);
      }),
  };
};

function getStartEndAndTotalAngle(range, rangeMax) {
  const rangeLength = getRangeLength(
    { start: range.start, end: range.end },
    rangeMax
  );

  return {
    startAngle: 2 * Math.PI * (range.start / rangeMax),
    totalAngle: (rangeLength / rangeMax) * Math.PI * 2,
    endAngle: (2 * Math.PI * (range.end + 1)) / rangeMax, //use a +1 here because the angle must encompass the end of the annotation
  };
}
