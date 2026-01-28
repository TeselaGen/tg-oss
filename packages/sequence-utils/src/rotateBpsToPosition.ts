export default function rotateBpsToPosition(
  bps: string,
  caretPosition: number
) {
  return arrayRotate(bps.split(""), caretPosition).join("");
}

function arrayRotate<T>(arr: T[], count: number): T[] {
  count -= arr.length * Math.floor(count / arr.length);
  arr.push(...arr.splice(0, count));
  return arr;
}
