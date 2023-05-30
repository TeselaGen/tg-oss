//UNDER CONSTRUCTION

const { get } = require("lodash");
const {
  // getSequenceWithinRange,
  normalizePositionByRangeLength,
  getRangeLength
} = require("@teselagen/range-utils");

module.exports = function getVirtualDigest({
  cutsites,
  sequenceLength,
  isCircular,
  computePartialDigest,
  computePartialDigestDisabled,
  computeDigestDisabled
}) {
  let fragments = [];
  const overlappingEnzymes = [];
  const pairs = [];

  const sortedCutsites = cutsites.sort((a, b) => {
    return a.topSnipPosition - b.topSnipPosition;
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
      cut1.topSnipPosition,
      sequenceLength
    );
    const end = normalizePositionByRangeLength(
      cut2.topSnipPosition - 1,
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
        }
      };
      const frag2 = {
        start: 0,
        end: end,
        cut1: {
          type: "startOfSeq",
          restrictionEnzyme: {
            name: "Start Of Seq"
          }
        },
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
};

function addSizeIdName(frag, sequenceLength) {
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
