module.exports = function rotateBpsToPosition(
  bps,
  caretPosition,
) {
  return arrayRotate(bps.split(""), caretPosition).join("")
};


function arrayRotate(arr, count) {
  count -= arr.length * Math.floor(count / arr.length)
  arr.push.apply(arr, arr.splice(0, count))
  return arr
}