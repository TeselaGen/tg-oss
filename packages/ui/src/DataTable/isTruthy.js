export function isTruthy(v) {
  if (!v) return false;
  if (typeof v === "string") {
    if (v.toLowerCase() === "false") {
      return false;
    }
    if (v.toLowerCase() === "no") {
      return false;
    }
  }
  return true;
}
