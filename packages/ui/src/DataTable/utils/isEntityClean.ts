export function isEntityClean(e: { [key: string]: unknown } | null): boolean {
  if (typeof e !== "object" || e === null) {
    return true; // or return false depending on what you want for non-object inputs
  }
  let isClean = true;
  for (const [key, val] of Object.entries(e)) {
    if (key === "id") continue;
    if (key === "_isClean") continue;
    if (val) {
      isClean = false;
      break;
    }
  }
  return isClean;
}
