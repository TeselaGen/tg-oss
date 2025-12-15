import { flatMap } from "lodash-es";
import cutSequenceByRestrictionEnzyme from "./cutSequenceByRestrictionEnzyme";
import { CutSite, RestrictionEnzyme } from "./types";

export default function getCutsitesFromSequence(
  sequence: string,
  circular: boolean,
  contextEnzymes: RestrictionEnzyme[]
): Record<string, CutSite[]> {
  const cutsites = flatMap(contextEnzymes, enzyme => {
    return cutSequenceByRestrictionEnzyme(sequence, circular, enzyme);
  });
  const cutsitesByNameMap: Record<string, CutSite[]> = {};
  cutsites.forEach(cutsite => {
    const name = cutsite.name || "";
    if (!cutsitesByNameMap[name]) {
      cutsitesByNameMap[name] = [];
    }
    cutsitesByNameMap[name].push(cutsite);
  });
  return cutsitesByNameMap;
}
