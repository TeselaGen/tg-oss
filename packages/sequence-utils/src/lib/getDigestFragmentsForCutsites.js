import {normalizePositionByRangeLength, getRangeLength} from "@teselagen/range-utils";

export default function getDigestFragmentsForCutsites(
  sequenceLength,
  circular,
  cutsites,
  opts = {}
) {
  const fragments = [];
  const overlappingEnzymes = [];
  const pairs = [];
  if (!cutsites.length) return [];
  let sortedCutsites = cutsites.sort((a, b) => {
    return a.topSnipPosition - b.topSnipPosition;
  });

  if (!circular) {
    //if linear, add 2 fake cutsites for the start and end of the seq
    sortedCutsites = [
      {
        topSnipPosition: 0,
        bottomSnipPosition: 0,
        overhangSize: 0,
        type: "START_OR_END_OF_SEQ",
        name: "START_OF_SEQ"
      },
      ...sortedCutsites,
      {
        topSnipPosition: sequenceLength,
        bottomSnipPosition: sequenceLength,
        overhangSize: 0,
        type: "START_OR_END_OF_SEQ",
        name: "END_OF_SEQ"
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
      cut1.topSnipPosition,
      sequenceLength
    );
    const end = normalizePositionByRangeLength(
      cut2.topSnipPosition - 1,
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
      id
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
};
