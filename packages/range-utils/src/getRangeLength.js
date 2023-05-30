var provideInclusiveOptions = require("./provideInclusiveOptions");
module.exports = provideInclusiveOptions(getRangeLength);
function getRangeLength(range, rangeMax) {
  let toRet;
  if (range.end < range.start) {
    toRet = rangeMax - range.start + range.end + 1;
  } else {
    toRet = range.end - range.start + 1;
  }
  if (range.overlapsSelf && rangeMax) {
    toRet += rangeMax;
  }
  return toRet;
}
