import {
  findSequenceMatches,
  findApproxMatches
} from "@teselagen/sequence-utils";
import sequenceSelector from "./sequenceSelector";
import { createSelector } from "reselect";
import circularSelector from "./circularSelector";

function searchLayersSelector(
  sequence,
  isCircular,
  isOpen,
  searchString,
  ambiguousOrLiteral,
  dnaOrAA,
  isProtein,
  proteinSequence,
  mismatchesAllowed,
  tempSearchLayers = []
) {
  const toReturn = [...tempSearchLayers];
  if (!searchString || !isOpen) {
    return toReturn;
  }
  if (isProtein) {
    const searchingDna = dnaOrAA === "DNA";
    const matches = findSequenceMatches(
      searchingDna ? sequence : proteinSequence,
      searchString,
      {
        isCircular: false,
        isProteinSequence: true,
        isAmbiguous: ambiguousOrLiteral === "AMBIGUOUS",
        // isProteinSearch: dnaOrAA !== "DNA",
        searchReverseStrand: false
      }
    ).sort(({ start }, { start: start2 }) => {
      return start - start2;
    });
    const r = searchingDna
      ? matches
      : matches.map(({ start, end, ...rest }) => ({
          ...rest,
          isSearchLayer: true,
          start: start * 3,
          end: end * 3 + 2
        }));
    return [...toReturn, ...r];
  }

  // Use findApproxMatches when literal matching DNA with mismatches allowed
  if (
    dnaOrAA === "DNA" &&
    ambiguousOrLiteral === "LITERAL" &&
    mismatchesAllowed > 0
  ) {
    const approxMatches = findApproxMatches(
      searchString,
      sequence,
      mismatchesAllowed,
      isCircular
    );
    // Convert approximate matches to the format expected by the application
    const matches = approxMatches
      .map(match => ({
        start: match.index,
        end: match.index + match.match.length - 1,
        matchedString: match.match,
        mismatchPositions: match.mismatchPositions,
        numMismatches: match.numMismatches,
        isSearchLayer: true,
        forward: true
      }))
      .sort((a, b) => a.start - b.start);
    return [
      ...toReturn,
      ...matches.map(match => ({
        ...match,
        className: "veSearchLayer"
      }))
    ];
  }

  // Use regular findSequenceMatches for all other cases
  const matches = findSequenceMatches(sequence, searchString, {
    isCircular,
    isAmbiguous: ambiguousOrLiteral === "AMBIGUOUS",
    isProteinSearch: dnaOrAA !== "DNA",
    searchReverseStrand: true
  }).sort(({ start }, { start: start2 }) => {
    return start - start2;
  });
  return [
    ...toReturn,
    ...matches.map(match => ({
      ...match,
      forward: !match.bottomStrand,
      className:
        "veSearchLayer " +
        (match.bottomStrand ? " veSearchLayerBottomStrand" : ""),
      isSearchLayer: true
    }))
  ];
}

export default createSelector(
  sequenceSelector,
  circularSelector,
  state => state.findTool && state.findTool.isOpen,
  state => state.findTool && state.findTool.searchText,
  state => state.findTool && state.findTool.ambiguousOrLiteral,
  state => state.findTool && state.findTool.dnaOrAA,
  state => state.sequenceData.isProtein,
  state => state.sequenceData.proteinSequence,
  state => state.findTool && state.findTool.mismatchesAllowed,
  state => state.temporaryAnnotations?.searchLayers,
  searchLayersSelector
);
