import shortid from "shortid";
import { flatMap, cloneDeep } from "lodash-es";
import {
  normalizePositionByRangeLength,
  getRangeLength
} from "@teselagen/range-utils";
import getCutsitesFromSequence from "./getCutsitesFromSequence";
import { CutSite, DigestFragment, RestrictionEnzyme } from "./types";

// Explicitly define the params interface
export interface ComputeDigestFragmentsParams {
  cutsites: CutSite[];
  sequenceLength: number;
  circular: boolean;
  includeOverAndUnderHangs?: boolean;
  computePartialDigest?: boolean;
  computeDigestDisabled?: boolean;
  computePartialDigestDisabled?: boolean;
  selectionLayerUpdate?: (params: {
    start: number;
    end: number;
    name: string;
  }) => void;
  updateSelectedFragment?: (id: string) => void;
}

export function computeDigestFragments({
  cutsites,
  sequenceLength,
  circular,
  //optional:
  includeOverAndUnderHangs,
  computePartialDigest,
  computeDigestDisabled,
  computePartialDigestDisabled,
  selectionLayerUpdate,
  updateSelectedFragment
}: ComputeDigestFragmentsParams) {
  const fragments: DigestFragment[] = [];
  const overlappingEnzymes: DigestFragment[] = [];
  const pairs: CutSite[][] = [];

  const sortedCutsites = cutsites.filter(
    (
      c
    ): c is CutSite & { topSnipPosition: number; bottomSnipPosition: number } =>
      c.topSnipPosition != null && c.bottomSnipPosition != null
  );
  if (!circular && cutsites.length) {
    sortedCutsites.push({
      id: "seqTerm_" + shortid(),
      start: 0,
      end: 0,
      overhangBps: "",
      topSnipPosition: 0,
      bottomSnipPosition: 0,
      overhangSize: 0, // Added to satisfy CutSite
      upstreamTopSnip: 0,
      upstreamBottomSnip: 0,
      upstreamTopBeforeBottom: false,
      topSnipBeforeBottom: false,
      recognitionSiteRange: {
        start: 0,
        end: 0
      },
      forward: true,
      name: "Sequence_Terminus",
      type: "START_OR_END_OF_SEQ",
      restrictionEnzyme: {
        name: "Sequence_Terminus",
        site: "",
        forwardRegex: "",
        reverseRegex: ""
      }
    });
  }

  sortedCutsites.sort((a, b) => {
    return a.topSnipPosition - b.topSnipPosition;
  });

  sortedCutsites.forEach((cutsite1, index) => {
    if (!computeDigestDisabled) {
      pairs.push([
        cutsite1,
        sortedCutsites[index + 1]
          ? sortedCutsites[index + 1]
          : sortedCutsites[0]
      ]);
    }
    if (computePartialDigest && !computePartialDigestDisabled) {
      sortedCutsites.forEach((cs, index2) => {
        // Filter out adjacent cutsites (standard digest handles these)
        const isAdjacent =
          index2 === index + 1 ||
          (index === sortedCutsites.length - 1 && index2 === 0);
        if (isAdjacent) {
          return;
        }
        pairs.push([cutsite1, sortedCutsites[index2]]);
      });
    }
  });

  pairs.forEach(r => {
    let [cut1, cut2] = r;

    let start: number;
    let end: number;
    let size: number;
    start = normalizePositionByRangeLength(
      cut1.topSnipPosition!,
      sequenceLength
    );
    end = normalizePositionByRangeLength(
      cut2.topSnipPosition! - 1,
      sequenceLength
    );
    size = getRangeLength({ start, end }, sequenceLength);
    let overlapsSelf: boolean | undefined;
    if (includeOverAndUnderHangs) {
      const oldSize = size;
      start = normalizePositionByRangeLength(
        cut1.topSnipBeforeBottom
          ? cut1.topSnipPosition!
          : cut1.bottomSnipPosition!,
        sequenceLength
      );
      end = normalizePositionByRangeLength(
        cut2.topSnipBeforeBottom
          ? cut2.bottomSnipPosition! - 1
          : cut2.topSnipPosition! - 1,
        sequenceLength
      );
      size = getRangeLength({ start, end }, sequenceLength);
      if (oldSize > size) {
        //we've got a part that wraps on itself
        overlapsSelf = true;
        size += sequenceLength;
      }
    }

    let isFormedFromLinearEnd: boolean | undefined;
    if (cut1.name === "Sequence_Terminus") {
      cut1 = cloneDeep(cut1);
      isFormedFromLinearEnd = true;
      cut1.name = "Linear_Sequence_Start";
      cut1.restrictionEnzyme.name = "Linear_Sequence_Start";
    } else if (cut2.name === "Sequence_Terminus") {
      cut2 = cloneDeep(cut2);
      isFormedFromLinearEnd = true;
      cut2.name = "Linear_Sequence_End";
      cut2.restrictionEnzyme.name = "Linear_Sequence_End";
    }

    // Add isOverhangIncludedInFragmentSize logic
    cut1 = {
      ...cut1,
      isOverhangIncludedInFragmentSize:
        cut1.name !== "Linear_Sequence_Start" &&
        cut1.name !== "Sequence_Terminus" &&
        (cut1.overhangSize || 0) > 0 &&
        !!cut1.topSnipBeforeBottom
    };
    cut2 = {
      ...cut2,
      isOverhangIncludedInFragmentSize:
        cut2.name !== "Linear_Sequence_End" &&
        cut2.name !== "Sequence_Terminus" &&
        (cut2.overhangSize || 0) > 0 &&
        !cut2.topSnipBeforeBottom
    };

    const id = start + "-" + end + "-" + size + "-";
    const name = `${cut1.restrictionEnzyme.name} -- ${cut2.restrictionEnzyme.name} ${size} bps`;
    // getRangeLength({ start, end }, sequenceLength);

    fragments.push({
      isFormedFromLinearEnd,
      madeFromOneCutsite: cut1.id === cut2.id,
      start,
      end,
      size,
      overlapsSelf,
      id,
      name,
      cut1,
      cut2,
      onFragmentSelect:
        selectionLayerUpdate && updateSelectedFragment
          ? () => {
              selectionLayerUpdate({
                start,
                end,
                name
              });

              updateSelectedFragment(id);
            }
          : undefined
    });
  });
  fragments.filter(fragment => {
    if (!fragment.size) {
      overlappingEnzymes.push(fragment);
      return false;
    }
    return true;
  });
  return {
    computePartialDigestDisabled,
    computeDigestDisabled,
    fragments,
    overlappingEnzymes
  };
}

export function getDigestFragsForSeqAndEnzymes({
  sequence,
  circular,
  enzymes,
  includeOverAndUnderHangs
}: {
  sequence: string;
  circular: boolean;
  enzymes: RestrictionEnzyme[];
  includeOverAndUnderHangs?: boolean;
}) {
  const cutsitesByName = getCutsitesFromSequence(sequence, circular, enzymes);
  const digest = computeDigestFragments({
    includeOverAndUnderHangs,
    cutsites: flatMap(cutsitesByName) as CutSite[],
    sequenceLength: sequence.length,
    circular
  });
  digest.fragments.sort((a, b) => b.size - a.size);
  return digest;
}
