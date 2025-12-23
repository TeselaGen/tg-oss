import {
  modulateRangeBySequenceLength,
  flipContainedRange,
  Range
} from "@teselagen/range-utils";
import { reduce, uniqBy } from "lodash-es";
import escapeStringRegexp from "escape-string-regexp";
import getAminoAcidStringFromSequenceString from "./getAminoAcidStringFromSequenceString";
import { ambiguous_dna_values, extended_protein_values } from "./bioData";
import getReverseComplementSequenceString from "./getReverseComplementSequenceString";

export interface FindSequenceMatchesOptions {
  searchReverseStrand?: boolean;
  isCircular?: boolean;
  isAmbiguous?: boolean;
  isProteinSequence?: boolean;
  isProteinSearch?: boolean;
}

export default function findSequenceMatches(
  sequence: string,
  searchString: string,
  options: FindSequenceMatchesOptions = {}
): (Range & { bottomStrand?: boolean })[] {
  let matches = findSequenceMatchesTopStrand(sequence, searchString, options);
  const { searchReverseStrand } = options;

  if (searchReverseStrand) {
    const sequenceLength = sequence.length;
    const reverseSeq = getReverseComplementSequenceString(sequence);
    const reverseMatches = findSequenceMatchesTopStrand(
      reverseSeq,
      searchString,
      options
    );
    const flippedReverseMatches = reverseMatches.map(range => {
      return {
        ...flipContainedRange(
          range,
          { start: 0, end: sequenceLength - 1 },
          sequenceLength
        ),
        bottomStrand: true
      };
    });
    matches = [...matches, ...flippedReverseMatches];
  }
  return matches;
}

function findSequenceMatchesTopStrand(
  sequence: string,
  searchString: string,
  options: FindSequenceMatchesOptions = {}
): Range[] {
  const { isCircular, isAmbiguous, isProteinSequence, isProteinSearch } =
    options;
  let searchStringToUse = escapeStringRegexp(searchString);
  if (isAmbiguous) {
    if (isProteinSearch || isProteinSequence) {
      searchStringToUse = convertAmbiguousStringToRegex(
        searchStringToUse,
        true
      );
    } else {
      //we're searching DNA
      searchStringToUse = convertAmbiguousStringToRegex(
        searchStringToUse,
        false
      );
    }
  }
  if (!searchStringToUse) return []; //short circuit if nothing is actually being searched for (eg searching for "%%"")
  let sequenceToUse = sequence;
  if (isCircular) {
    sequenceToUse = sequenceToUse + sequenceToUse;
  }

  let sequencesToCheck = [{ seqToCheck: sequenceToUse, offset: 0 }];
  if (isProteinSearch) {
    sequencesToCheck = [
      {
        seqToCheck: getAminoAcidStringFromSequenceString(sequenceToUse, {
          doNotExcludeAsterisk: true
        }),
        offset: 0
      },
      {
        seqToCheck: getAminoAcidStringFromSequenceString(
          sequenceToUse.substr(1),
          { doNotExcludeAsterisk: true }
        ),
        offset: 1
      },
      {
        seqToCheck: getAminoAcidStringFromSequenceString(
          sequenceToUse.substr(2),
          { doNotExcludeAsterisk: true }
        ),
        offset: 2
      }
    ];
  }

  const ranges: Range[] = [];
  sequencesToCheck.forEach(({ seqToCheck, offset }) => {
    const reg = new RegExp(searchStringToUse, "ig");
    let match: RegExpExecArray | null;
    let range: Range;
    /* eslint-disable no-cond-assign*/

    while ((match = reg.exec(seqToCheck)) !== null) {
      range = {
        start: match.index,
        end: match.index + searchString.length - 1 //this should be the original searchString here j
      };
      if (isProteinSearch) {
        range.start = range.start * 3 + offset;
        range.end = range.end * 3 + 2 + offset;
      }
      ranges.push(modulateRangeBySequenceLength(range, sequence.length));
      reg.lastIndex = match.index + 1;
    }
    /* eslint-enable no-cond-assign*/
  });

  return uniqBy(ranges, e => {
    return e.start + "-" + e.end;
  });
}

function convertAmbiguousStringToRegex(string: string, isProtein: boolean) {
  // Search for a DNA subseq in sequence.
  // use ambiguous values (like N = A or T or C or G, R = A or G etc.)
  // searches only on forward strand
  return reduce(
    string,
    (acc, char) => {
      const value = isProtein
        ? (extended_protein_values as Record<string, string>)[
            char.toUpperCase()
          ]
        : (ambiguous_dna_values as Record<string, string>)[char.toUpperCase()];
      if (!value) return acc;
      if (value.length === 1) {
        acc += value;
      } else {
        acc += `[${value}]`;
      }
      return acc;
    },
    ""
  );
}
