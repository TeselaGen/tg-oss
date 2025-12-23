import {
  normalizePositionByRangeLength,
  getRangeLength
} from "@teselagen/range-utils";
import { CutSite, DigestFragment } from "./types";

export default function getDigestFragmentsForCutsites(
  sequenceLength: number,
  circular: boolean,
  cutsites: CutSite[],
  opts: { computePartialDigests?: boolean } = {}
): DigestFragment[] {
  const fragments: DigestFragment[] = [];
  const overlappingEnzymes: DigestFragment[] = [];
  const pairs: CutSite[][] = [];
  if (!cutsites.length) return [];
  let sortedCutsites = cutsites.sort((a, b) => {
    return (a.topSnipPosition || 0) - (b.topSnipPosition || 0);
  });

  if (!circular) {
    //if linear, add 2 fake cutsites for the start and end of the seq
    sortedCutsites = [
      {
        start: 0,
        end: 0,
        topSnipPosition: 0,
        bottomSnipPosition: 0,
        overhangSize: 0,
        type: "START_OR_END_OF_SEQ",
        name: "START_OF_SEQ",
        restrictionEnzyme: {
          name: "START_OF_SEQ",
          site: "",
          forwardRegex: "",
          reverseRegex: ""
        }
      },
      ...sortedCutsites,
      {
        start: sequenceLength,
        end: sequenceLength,
        topSnipPosition: sequenceLength,
        bottomSnipPosition: sequenceLength,
        overhangSize: 0,
        type: "START_OR_END_OF_SEQ",
        name: "END_OF_SEQ",
        restrictionEnzyme: {
          name: "END_OF_SEQ",
          site: "",
          forwardRegex: "",
          reverseRegex: ""
        }
      }
    ];
  }

  sortedCutsites.forEach((cutsite1, index) => {
    if (!circular && !sortedCutsites[index + 1]) {
      return; //don't push a pair if the sequence is linear and we've reached the end of our cutsites array
    }
    if (opts.computePartialDigests) {
      sortedCutsites.forEach((cs, index2) => {
        if (index2 === index + 1 || index2 === 0) {
          return;
        }
        pairs.push([cutsite1, sortedCutsites[index2]]);
      });
    }
    pairs.push([
      cutsite1,
      sortedCutsites[index + 1] ? sortedCutsites[index + 1] : sortedCutsites[0]
    ]);
  });

  pairs.forEach(([cut1, cut2]) => {
    const start = normalizePositionByRangeLength(
      cut1.topSnipPosition || 0,
      sequenceLength
    );
    const end = normalizePositionByRangeLength(
      (cut2.topSnipPosition || 0) - 1,
      sequenceLength
    );
    const fragmentRange = { start, end };
    const size = getRangeLength(fragmentRange, sequenceLength);

    // const id = uniqid()
    const id = start + "-" + end + "-" + size + "-";

    // getRangeLength({ start, end }, sequenceLength);

    fragments.push({
      // I don't think we can determine containsFive/ThreePrimeRecognitionSite until the inclusion/exclusion of the overhangs is done
      // containsFivePrimeRecognitionSite: cut1.type !== "START_OR_END_OF_SEQ" && isRangeWithinRange(cut1.recognitionSiteRange, fragmentRange, sequenceLength ) ,
      // containsThreePrimeRecognitionSite: cut2.type !== "START_OR_END_OF_SEQ" && isRangeWithinRange(cut1.recognitionSiteRange,  fragmentRange, sequenceLength) ,
      cut1: {
        ...cut1,
        isOverhangIncludedInFragmentSize:
          cut1.type !== "START_OR_END_OF_SEQ" &&
          cut1.overhangSize > 0 &&
          cut1.topSnipBeforeBottom
      },
      cut2: {
        ...cut2,
        isOverhangIncludedInFragmentSize:
          cut2.type !== "START_OR_END_OF_SEQ" &&
          cut2.overhangSize > 0 &&
          !cut2.topSnipBeforeBottom
      },
      ...fragmentRange,
      size,
      id,
      name: `${cut1.restrictionEnzyme.name} -- ${cut2.restrictionEnzyme.name} ${size} bps` // Add missing name property
    });
  });

  fragments.filter(fragment => {
    if (!fragment.size) {
      overlappingEnzymes.push(fragment);
      return false;
    }
    return true;
  });
  return fragments;
}
