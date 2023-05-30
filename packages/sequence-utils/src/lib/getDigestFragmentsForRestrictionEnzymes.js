import getDigestFragmentsForCutsites from "./getDigestFragmentsForCutsites";
import cutSequenceByRestrictionEnzyme from "./cutSequenceByRestrictionEnzyme";
import {flatMap} from "lodash";

export default function getDigestFragmentsForRestrictionEnzymes(
  sequence,
  circular,
  restrictionEnzymeOrEnzymes,
  opts
) {
  const restrictionEnzymes = Array.isArray(restrictionEnzymeOrEnzymes)
    ? restrictionEnzymeOrEnzymes
    : [restrictionEnzymeOrEnzymes];
  const cutsites = flatMap(restrictionEnzymes, restrictionEnzyme => {
    return cutSequenceByRestrictionEnzyme(
      sequence,
      circular,
      restrictionEnzyme
    );
  });
  return getDigestFragmentsForCutsites(
    sequence.length,
    circular,
    cutsites,
    opts
  );
};
