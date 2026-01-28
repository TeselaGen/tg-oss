import { computeDigestFragments } from "./computeDigestFragments";
import getCutsitesFromSequence from "./getCutsitesFromSequence";
import { CutSite, RestrictionEnzyme } from "./types";
import { flatMap, uniqBy } from "lodash-es";

export default function getDigestFragmentsForRestrictionEnzymes(
  sequence: string,
  circular: boolean,
  contextEnzymes: RestrictionEnzyme[] | RestrictionEnzyme,
  options?: {
    computePartialDigest?: boolean;
    computePartialDigests?: boolean; // alias
    computeDigestDisabled?: boolean; // corrected spelling if needed, but keeping as is
    computePartialDigestDisabled?: boolean;
    includeOverAndUnderHangs?: boolean;
  }
) {
  const cutsitesByName = getCutsitesFromSequence(
    sequence,
    circular,
    Array.isArray(contextEnzymes) ? contextEnzymes : [contextEnzymes]
  );
  const digest = computeDigestFragments({
    cutsites: flatMap(cutsitesByName) as CutSite[],
    sequenceLength: sequence.length,
    circular,
    ...options,
    computePartialDigest:
      options?.computePartialDigest || options?.computePartialDigests
  });
  const fragments = uniqBy(digest.fragments, fragment => {
    return `${fragment.start}-${fragment.end}-${fragment.size}`;
  });
  if (
    circular &&
    (options?.computePartialDigest || options?.computePartialDigests)
  ) {
    // filter out the full length fragment if it's a duplicate
    const fullLengthFragmentIndex = fragments.findIndex(
      f => f.size === sequence.length
    );
    if (fullLengthFragmentIndex > -1) {
      fragments.splice(fullLengthFragmentIndex, 1);
    }
  }

  return fragments.sort((a, b) => {
    return a.start - b.start || b.size - a.size;
  });
}
