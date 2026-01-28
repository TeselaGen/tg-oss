import { RestrictionEnzyme } from "./types";

export default function doesEnzymeChopOutsideOfRecognitionSite(
  enzyme: RestrictionEnzyme
): boolean {
  if (
    enzyme.topSnipOffset &&
    enzyme.bottomSnipOffset &&
    (enzyme.topSnipOffset > enzyme.site.length ||
      enzyme.bottomSnipOffset > enzyme.site.length)
  ) {
    return true;
  } else {
    return false;
  }
}
