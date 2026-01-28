import { RestrictionEnzyme } from "./types";

export default function getCutsiteType(
  restrictionEnzyme: RestrictionEnzyme
): string {
  const { topSnipOffset, bottomSnipOffset } = restrictionEnzyme;
  if (topSnipOffset === bottomSnipOffset) {
    return "blunt";
  } else if (
    topSnipOffset !== undefined &&
    bottomSnipOffset !== undefined &&
    topSnipOffset < bottomSnipOffset
  ) {
    return "5' overhang";
  } else {
    return "3' overhang";
  }
}
