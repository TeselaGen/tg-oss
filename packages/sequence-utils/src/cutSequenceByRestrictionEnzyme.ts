import { assign } from "lodash-es";
import shortid from "shortid";
import getReverseComplementSequenceString from "./getReverseComplementSequenceString";

import {
  getSequenceWithinRange,
  normalizePositionByRangeLength,
  reversePositionInRange
} from "@teselagen/range-utils";
import { CutSite, RestrictionEnzyme } from "./types";

export default function cutSequenceByRestrictionEnzyme(
  pSequence: string,
  circular: boolean,
  restrictionEnzyme: RestrictionEnzyme
): CutSite[] {
  if (
    !restrictionEnzyme.forwardRegex || // Add check for undefined
    !restrictionEnzyme.reverseRegex || // Add check for undefined
    restrictionEnzyme.forwardRegex.length === 0 ||
    restrictionEnzyme.reverseRegex.length === 0
  ) {
    // strict check: previously this returned an array with an error property
    // throwing error or returning empty array + console warning might be better
    // but preserving return type signature CutSite[]
    console.warn(
      "Cannot cut sequence. Enzyme restriction site must be at least 1 bp long."
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const returnVal: any = [];
    returnVal.error =
      "Cannot cut sequence. Enzyme restriction site must be at least 1 bp long.";
    return returnVal;
  }
  const forwardRegExpPattern = new RegExp(restrictionEnzyme.forwardRegex, "ig");
  const sequence = pSequence;

  const cutsitesForward = cutSequence(
    forwardRegExpPattern,
    restrictionEnzyme,
    sequence,
    circular
  );
  let cutsitesReverse: CutSite[] = [];
  if (restrictionEnzyme.forwardRegex !== restrictionEnzyme.reverseRegex) {
    const revSequence = getReverseComplementSequenceString(sequence);
    cutsitesReverse = cutSequence(
      forwardRegExpPattern,
      restrictionEnzyme,
      revSequence,
      circular
    );
    cutsitesReverse = cutsitesReverse.map(cutsite => {
      return reverseAllPositionsOfCutsite(cutsite, sequence.length);
    });
  }
  return cutsitesForward.concat(cutsitesReverse);

  function reverseAllPositionsOfCutsite(
    cutsite: CutSite,
    rangeLength: number
  ): CutSite {
    cutsite = assign({}, cutsite); // copy first
    cutsite.start = reversePositionInRange(cutsite.start, rangeLength, false);
    cutsite.end = reversePositionInRange(cutsite.end, rangeLength, false);
    cutsite.topSnipPosition =
      cutsite.topSnipPosition != null
        ? reversePositionInRange(cutsite.topSnipPosition, rangeLength, true)
        : null;
    cutsite.bottomSnipPosition =
      cutsite.bottomSnipPosition != null
        ? reversePositionInRange(cutsite.bottomSnipPosition, rangeLength, true)
        : null;
    if (cutsite.cutType === 1 && cutsite.cutsTwice) {
      // Assuming cutsTwice is a custom property or inferred from cutType
      if (
        cutsite.upstreamTopSnip != null &&
        cutsite.upstreamBottomSnip != null
      ) {
        cutsite.upstreamTopSnip = reversePositionInRange(
          cutsite.upstreamTopSnip,
          rangeLength,
          true
        );
        cutsite.upstreamBottomSnip = reversePositionInRange(
          cutsite.upstreamBottomSnip,
          rangeLength,
          true
        );
      }
    }
    if (cutsite.recognitionSiteRange) {
      cutsite.recognitionSiteRange = { ...cutsite.recognitionSiteRange };
      cutsite.recognitionSiteRange.start = reversePositionInRange(
        cutsite.recognitionSiteRange.start,
        rangeLength,
        false
      );
      cutsite.recognitionSiteRange.end = reversePositionInRange(
        cutsite.recognitionSiteRange.end,
        rangeLength,
        false
      );
    }

    return {
      ...cutsite,
      start: cutsite.end,
      end: cutsite.start,
      overhangBps: getReverseComplementSequenceString(
        (cutsite.overhangBps as unknown as string) || ""
      ),
      topSnipPosition: cutsite.bottomSnipPosition,
      bottomSnipPosition: cutsite.topSnipPosition,
      upstreamTopSnip: cutsite.upstreamBottomSnip,
      upstreamBottomSnip: cutsite.upstreamTopSnip,
      upstreamTopBeforeBottom: !!cutsite.upstreamTopBeforeBottom,
      topSnipBeforeBottom: !!cutsite.topSnipBeforeBottom,
      recognitionSiteRange: cutsite.recognitionSiteRange
        ? {
            start: cutsite.recognitionSiteRange.end,
            end: cutsite.recognitionSiteRange.start
          }
        : undefined,
      forward: false
    };
  }
}

function cutSequence(
  forwardRegExpPattern: RegExp,
  restrictionEnzyme: RestrictionEnzyme,
  sequence: string,
  circular: boolean
): CutSite[] {
  const restrictionCutSites: CutSite[] = [];
  let restrictionCutSite: CutSite;
  const recognitionSiteLength = restrictionEnzyme.site.length;
  // const originalSequenceLength =
  //   sequence.length / (circular && sequence.length > 0 ? 2 : 1); // rough access if already doublified?
  // Wait, existing code passed pSequence. Then if circular, sequence += sequence.
  // So argument `sequence` to this function `cutSequence` is passed PSequence inside the main function?
  // No, main function passes `sequence` which is `pSequence`.
  // Check main function:
  // const sequence = pSequence;
  // const cutsitesForward = cutSequence(..., sequence, circular)
  // Inside cutSequence:
  // const originalSequence = sequence;
  // if (circular) sequence += sequence;
  // So input `sequence` to this function `cutSequence` is passed PSequence inside the main function?

  const originalSequence = sequence; // this is single length
  const originalSequenceLengthVal = sequence.length;
  if (circular) {
    sequence += sequence;
  }
  const currentSequenceLength = sequence.length;

  let matchIndex = sequence.search(forwardRegExpPattern);
  let startIndex = 0;
  let subSequence = sequence;

  while (matchIndex !== -1) {
    const recognitionSiteRange: { start: number; end: number } = {
      start: 0,
      end: 0
    };
    let start: number;
    let end: number;
    let upstreamTopSnip: number | null = null;
    let upstreamBottomSnip: number | null = null;
    let upstreamTopBeforeBottom = false;
    let topSnipPosition: number | null = null;
    let bottomSnipPosition: number | null = null;
    let topSnipBeforeBottom = false;

    let fitsWithinSequence = false;

    recognitionSiteRange.start = matchIndex + startIndex;
    start = recognitionSiteRange.start;

    recognitionSiteRange.end =
      matchIndex + recognitionSiteLength - 1 + startIndex;
    end = recognitionSiteRange.end;

    if (restrictionEnzyme.cutType === 1) {
      if (
        restrictionEnzyme.usForward != null &&
        restrictionEnzyme.usReverse != null
      ) {
        upstreamTopSnip =
          recognitionSiteRange.end - restrictionEnzyme.usForward;
        upstreamBottomSnip =
          recognitionSiteRange.end - restrictionEnzyme.usReverse;

        if (upstreamTopSnip >= 0 && upstreamBottomSnip >= 0) {
          fitsWithinSequence = true;
          if (upstreamTopSnip < upstreamBottomSnip) {
            if (start > upstreamTopSnip) {
              start = upstreamTopSnip + 1;
            }
            upstreamTopBeforeBottom = true;
          } else {
            if (start > upstreamBottomSnip) {
              start = upstreamBottomSnip + 1;
            }
          }
          upstreamTopSnip = normalizePositionByRangeLength(
            upstreamTopSnip,
            originalSequenceLengthVal,
            true
          );
          upstreamBottomSnip = normalizePositionByRangeLength(
            upstreamBottomSnip,
            originalSequenceLengthVal,
            true
          );
        } else {
          upstreamTopSnip = null;
          upstreamBottomSnip = null;
        }
      }
    }

    //add downstream cutsite here
    topSnipPosition =
      recognitionSiteRange.start + (restrictionEnzyme.topSnipOffset || 0);
    bottomSnipPosition =
      recognitionSiteRange.start + (restrictionEnzyme.bottomSnipOffset || 0);
    if (
      bottomSnipPosition <= currentSequenceLength &&
      topSnipPosition <= currentSequenceLength
    ) {
      fitsWithinSequence = true;
      if (topSnipPosition > bottomSnipPosition) {
        if (topSnipPosition > recognitionSiteRange.end) {
          end = topSnipPosition - 1;
        }
      } else {
        if (bottomSnipPosition > recognitionSiteRange.end) {
          end = bottomSnipPosition - 1;
        }
        topSnipBeforeBottom = true;
      }
      topSnipPosition = normalizePositionByRangeLength(
        topSnipPosition,
        originalSequenceLengthVal,
        true
      );
      bottomSnipPosition = normalizePositionByRangeLength(
        bottomSnipPosition,
        originalSequenceLengthVal,
        true
      );
    } else {
      topSnipPosition = null;
      bottomSnipPosition = null;
    }

    if (
      fitsWithinSequence &&
      start >= 0 &&
      end >= 0 &&
      start < originalSequenceLengthVal &&
      end < currentSequenceLength
    ) {
      start = normalizePositionByRangeLength(
        start,
        originalSequenceLengthVal,
        false
      );
      end = normalizePositionByRangeLength(
        end,
        originalSequenceLengthVal,
        false
      );
      recognitionSiteRange.start = normalizePositionByRangeLength(
        recognitionSiteRange.start,
        originalSequenceLengthVal,
        false
      );
      recognitionSiteRange.end = normalizePositionByRangeLength(
        recognitionSiteRange.end,
        originalSequenceLengthVal,
        false
      );
      let cutRange = {
        start: -1,
        end: -1
      };

      if (
        topSnipPosition !== null &&
        bottomSnipPosition !== null &&
        topSnipPosition !== bottomSnipPosition
      ) {
        cutRange = topSnipBeforeBottom
          ? {
              start: topSnipPosition,
              end: normalizePositionByRangeLength(
                bottomSnipPosition - 1,
                originalSequenceLengthVal
              )
            }
          : {
              start: bottomSnipPosition,
              end: normalizePositionByRangeLength(
                topSnipPosition - 1,
                originalSequenceLengthVal
              )
            };
      }
      const overhangBps = getSequenceWithinRange(
        cutRange,
        originalSequence
      ) as string;

      restrictionCutSite = {
        id: shortid(),
        start,
        end,
        topSnipPosition: topSnipPosition, // Allow null
        bottomSnipPosition: bottomSnipPosition, // Allow null
        topSnipBeforeBottom,
        overhangBps,
        overhangSize: overhangBps.length,
        upstreamTopBeforeBottom,
        upstreamTopSnip,
        annotationTypePlural: "cutsites",
        upstreamBottomSnip,
        recognitionSiteRange,
        forward: true,
        name: restrictionEnzyme.name,
        restrictionEnzyme
      };
      restrictionCutSites.push(restrictionCutSite);
    }

    startIndex = startIndex + matchIndex + 1;

    subSequence = sequence.substring(startIndex, sequence.length);
    matchIndex = subSequence.search(forwardRegExpPattern);
  }
  return restrictionCutSites;
}
