import { RestrictionEnzyme } from "./types";

export default function isEnzymeType2S(e: RestrictionEnzyme) {
  return e.site.length < e.topSnipOffset || e.site.length < e.bottomSnipOffset;
}
