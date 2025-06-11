import { nanoid } from "nanoid";
import { flatMap, cloneDeep } from "lodash-es";
import {
  normalizePositionByRangeLength,
  getRangeLength
} from "@teselagen/range-utils";
import getCutsitesFromSequence from "./getCutsitesFromSequence";

function computeDigestFragments({
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
}) {
  const fragments = [];
  const overlappingEnzymes = [];
  const pairs = [];

  const sortedCutsites = cutsites.sort((a, b) => {
    return a.topSnipPosition - b.topSnipPosition;
  });
  if (!circular && cutsites.length) {
    sortedCutsites.push({
      id: "seqTerm_" + nanoid(),
      start: 0,
      end: 0,
      overhangBps: "",
      topSnipPosition: 0,
      bottomSnipPosition: 0,
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
      restrictionEnzyme: {
        name: "Sequence_Terminus"
      }
    });
  }

  sortedCutsites.forEach((cutsite1, index) => {
    if (computePartialDigest && !computePartialDigestDisabled) {
      sortedCutsites.forEach((cs, index2) => {
        if (index2 === index + 1 || index2 === 0) {
          return;
        }
        pairs.push([cutsite1, sortedCutsites[index2]]);
      });
    }
    if (!computeDigestDisabled) {
      pairs.push([
        cutsite1,
        sortedCutsites[index + 1]
          ? sortedCutsites[index + 1]
          : sortedCutsites[0]
      ]);
    }
  });

  pairs.forEach(r => {
    let [cut1, cut2] = r;

    let start;
    let end;
    let size;
    start = normalizePositionByRangeLength(
      cut1.topSnipPosition,
      sequenceLength
    );
    end = normalizePositionByRangeLength(
      cut2.topSnipPosition - 1,
      sequenceLength
    );
    size = getRangeLength({ start, end }, sequenceLength);
    let overlapsSelf;
    if (includeOverAndUnderHangs) {
      const oldSize = size;
      start = normalizePositionByRangeLength(
        cut1.topSnipBeforeBottom
          ? cut1.topSnipPosition
          : cut1.bottomSnipPosition,
        sequenceLength
      );
      end = normalizePositionByRangeLength(
        cut2.topSnipBeforeBottom
          ? cut2.bottomSnipPosition - 1
          : cut2.topSnipPosition - 1,
        sequenceLength
      );
      size = getRangeLength({ start, end }, sequenceLength);
      if (oldSize > size) {
        //we've got a part that wraps on itself
        overlapsSelf = true;
        size += sequenceLength;
      }
    }

    let isFormedFromLinearEnd;
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

    const id = start + "-" + end + "-" + size + "-";
    const name = `${cut1.restrictionEnzyme.name} -- ${cut2.restrictionEnzyme.name} ${size} bps`;
    getRangeLength({ start, end }, sequenceLength);

    fragments.push({
      isFormedFromLinearEnd,
      madeFromOneCutsite: cut1 === cut2,
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

function getDigestFragsForSeqAndEnzymes({
  sequence,
  circular,
  enzymes,
  includeOverAndUnderHangs
}) {
  const cutsitesByName = getCutsitesFromSequence(sequence, circular, enzymes);
  return computeDigestFragments({
    includeOverAndUnderHangs,
    cutsites: flatMap(cutsitesByName),
    sequenceLength: sequence.length,
    circular
  });
}

export { computeDigestFragments };
export { getDigestFragsForSeqAndEnzymes };
