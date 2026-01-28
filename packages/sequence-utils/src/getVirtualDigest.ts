//UNDER CONSTRUCTION

import { get } from "lodash-es";

import {
  normalizePositionByRangeLength,
  getRangeLength
} from "@teselagen/range-utils";
import { CutSite, DigestFragment } from "./types";

export default function getVirtualDigest({
  cutsites,
  sequenceLength,
  isCircular,
  computePartialDigest,
  computePartialDigestDisabled,
  computeDigestDisabled
}: {
  cutsites: CutSite[];
  sequenceLength: number;
  isCircular: boolean;
  computePartialDigest?: boolean;
  computePartialDigestDisabled?: boolean;
  computeDigestDisabled?: boolean;
}) {
  let fragments: DigestFragment[] = [];
  const overlappingEnzymes: DigestFragment[] = [];
  const pairs: CutSite[][] = [];

  const sortedCutsites = cutsites.sort((a, b) => {
    return (a.topSnipPosition || 0) - (b.topSnipPosition || 0);
  });

  sortedCutsites.forEach((cutsite1, index) => {
    if (computePartialDigest && !computePartialDigestDisabled) {
      sortedCutsites.forEach((cs, index2) => {
        // if (index2 === index + 1 || index2 === 0) { //tnw: not sure if this is necessary or not. commenting out for now
        //   return;
        // }
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

  pairs.forEach(([cut1, cut2]) => {
    const start = normalizePositionByRangeLength(
      cut1.topSnipPosition || 0,
      sequenceLength
    );
    const end = normalizePositionByRangeLength(
      (cut2.topSnipPosition || 0) - 1,
      sequenceLength
    );

    if (!isCircular && start > end) {
      //we have a fragment that spans the origin so we need to split it in 2 pieces
      const frag1 = {
        start: start,
        end: sequenceLength - 1,
        cut1,
        cut2: {
          type: "endOfSeq",
          restrictionEnzyme: {
            name: "End Of Seq"
          }
        } as unknown as CutSite // Cast to CutSite as it's a mock
      };
      const frag2 = {
        start: 0,
        end: end,
        cut1: {
          type: "startOfSeq",
          restrictionEnzyme: {
            name: "Start Of Seq"
          }
        } as unknown as CutSite, // Cast
        cut2: cut2
      };

      fragments.push(addSizeIdName(frag1, sequenceLength));
      fragments.push(addSizeIdName(frag2, sequenceLength));
    } else {
      const frag = {
        cut1,
        cut2,
        start,
        end
      };
      fragments.push(addSizeIdName(frag, sequenceLength));
    }
  });
  fragments = fragments.filter(fragment => {
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

function addSizeIdName(
  frag: { start: number; end: number; cut1: CutSite; cut2: CutSite },
  sequenceLength: number
): DigestFragment {
  const size = getRangeLength(
    { start: frag.start, end: frag.end },
    sequenceLength
  );
  const name = `${get(
    frag,
    "cut1.restrictionEnzyme.name",
    "Untitled Cutsite"
  )} -- ${get(
    frag,
    "cut2.restrictionEnzyme.name",
    "Untitled Cutsite"
  )} ${size} bps`;

  return {
    ...frag,
    size,
    name,
    id: frag.start + "-" + frag.end + "-" + size + "-"
  };
}
