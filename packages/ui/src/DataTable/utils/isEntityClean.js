export function isEntityClean(e) {
  let isClean = true;
  e.some((val, key) => {
    if (key === "id") return false;
    if (key === "_isClean") return false;
    if (val) {
      isClean = false;
      return true;
    }
    return false;
  });
  return isClean;
}
