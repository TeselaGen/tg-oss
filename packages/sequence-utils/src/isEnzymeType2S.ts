import { RestrictionEnzyme } from "./types";

export default function isEnzymeType2S(e: RestrictionEnzyme) {
  return (
    e.site.length < (e.topSnipOffset || 0) ||
    e.site.length < (e.bottomSnipOffset || 0)
  );
}
