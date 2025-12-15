import { computeDigestFragments } from "./computeDigestFragments";
import getCutsitesFromSequence from "./getCutsitesFromSequence";
import { CutSite, RestrictionEnzyme } from "./types";
import { flatMap } from "lodash-es";

export default function getDigestFragmentsForRestrictionEnzymes(
  sequence: string,
  circular: boolean,
  contextEnzymes: RestrictionEnzyme[],
  options?: {
    computePartialDigest?: boolean;
    computeDigestDisabled?: boolean;
    computePartialDigestDisabled?: boolean;
    includeOverAndUnderHangs?: boolean;
  }
) {
  const cutsitesByName = getCutsitesFromSequence(
    sequence,
    circular,
    contextEnzymes
  );
  return computeDigestFragments({
    cutsites: flatMap(cutsitesByName) as CutSite[],
    sequenceLength: sequence.length,
    circular,
    ...options
  });
}
