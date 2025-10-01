import {
  translateRange,
  getSequenceWithinRange,
  flipContainedRange,
  isPositionWithinRange
} from "@teselagen-biotech/range-utils";
import revComp from "./getReverseComplementSequenceString";
import getAA from "./getAminoAcidFromSequenceTriplet";

//
import proteinAlphabet from "./proteinAlphabet";

/**
 * @private
 * Gets the next triplet of bases in the sequenceString
 * @param  {Number} index The index of the sequenceString to start at
 * @param  {String} sequenceString The dna sequenceString.
 * @param  {Object[]} exonRange Array of ranges of the sequenceString that contains the positions of bases corresponding to exons.
 * @return {Object} The triplet of bases, the number of bases read, and the positions of the codon bases in the sequenceString
 * @property {String} triplet The triplet of bases
 * @property {Number} basesRead The number of bases read
 * @property {Number[]} codonPositions The positions of the codon bases in the sequenceString
 */
function getNextTriplet(index, sequenceString, exonRange) {
  let triplet = "";
  let internalIndex;
  // Positions of codons relative to the coding sequence start
  // including introns.
  const codonPositions = [];

  // A function to check if a base is within an exon
  const isBaseInExon = baseIndex =>
    exonRange.some(r =>
      isPositionWithinRange(baseIndex, r, sequenceString.length, true, false)
    );

  for (
    internalIndex = index;
    internalIndex < sequenceString.length;
    internalIndex++
  ) {
    // We have read three bases into the triplet (this has to be at the top of the loop)
    if (triplet.length === 3) {
      break;
    }
    // TODO: ask about ranges
    // The base corresponds to an intron
    if (isBaseInExon(internalIndex)) {
      // We read a base from the sequenceString
      triplet += sequenceString[internalIndex];
      codonPositions.push(internalIndex);
    }
  }

  return { triplet, basesRead: internalIndex - index, codonPositions };
}

/**
  * @private
  * Returns a series of derived properties from the arguments to getAminoAcidDataForEachBaseOfDna
  * @param  {String} originalSequenceString The dna sequenceString.
  * @param  {boolean} forward Whether the translation is in the forward direction.
  * @param  {Object} optionalSubrangeRange The range of the sequenceString to translate.
  * @param  {boolean} isProteinSequence Whether the sequenceString is a protein sequence.
  * @return {Object} The derived properties
  * @property {String} sequenceString
  * - If !isProtein: The subsequence within originalSequenceString that will be translated, defined by transaltionRange. If
  *   !forward, this will be the reverse complement of the subsequence.
  * - If isProtein: The originalSequenceString.
  * @property {Object} translationRange The range of the originalSequenceString that we're translating (if !isProtein), or getting DNA-level
    info for (if isProtein).
  * @property {Number} originalSequenceStringLength The length of the full DNA sequence. If !isProtein it's the length of originalSequenceString
  * @property {Number} sequenceStringLength The length of the DNA sequence that would give the translation.
  * @property {Object[]} exonRange Array of ranges of the sequenceString that contains the positions of bases corresponding to exons.
*/
function getTranslatedSequenceProperties(
  originalSequenceString,
  forward,
  optionalSubrangeRange,
  isProteinSequence
) {
  const originalSequenceStringLength = isProteinSequence
    ? originalSequenceString.length * 3
    : originalSequenceString.length;

  let sequenceString = originalSequenceString;
  const translationRange = { start: 0, end: originalSequenceStringLength - 1 };

  if (optionalSubrangeRange) {
    sequenceString = getSequenceWithinRange(
      optionalSubrangeRange,
      originalSequenceString
    );
    translationRange.start = optionalSubrangeRange.start;
    translationRange.end = optionalSubrangeRange.end;
  }

  const sequenceStringLength = isProteinSequence
    ? sequenceString.length * 3
    : sequenceString.length;

  if (!isProteinSequence && !forward) {
    sequenceString = revComp(sequenceString);
  }

  // TODO: what to do with protein if this is true?
  const absoluteExonRange =
    !isProteinSequence &&
    optionalSubrangeRange &&
    optionalSubrangeRange.locations
      ? optionalSubrangeRange.locations
      : [translationRange];
  const exonRange = absoluteExonRange.map(range => {
    let outputRange = translateRange(
      range,
      -translationRange.start,
      originalSequenceStringLength
    );
    if (!forward) {
      outputRange = flipContainedRange(
        outputRange,
        { start: 0, end: sequenceStringLength - 1 },
        sequenceStringLength
      );
    }
    return outputRange;
  });

  return {
    sequenceString,
    translationRange,
    sequenceStringLength,
    originalSequenceStringLength,
    exonRange
  };
}

/**
 * Function to convert the position within the CDS (where A in ATG is 0, and T in ATG is 1)
 * to the position in the main sequence
 *
 * @param  {Number} index The index of the sequenceString to start at
 * @param  {boolean} forward Whether the translation is in the forward direction.
 * @param  {Object} translationRange The range of the originalSequenceString that we're translating (if !isProtein), or getting DNA-level
 * info for (if isProtein).
 * @param  {Number} mainSequenceLength The length of the full DNA sequence. If !isProtein it's the length of originalSequenceString
 * @return {Number} The position in the main sequence
 *
 */
function positionInCdsToPositionInMainSequence(
  index,
  forward,
  translationRange,
  mainSequenceLength
) {
  let outputRange = translateRange(
    { start: index, end: index },
    translationRange.start,
    mainSequenceLength
  );
  if (!forward) {
    outputRange = flipContainedRange(
      outputRange,
      translationRange,
      mainSequenceLength
    );
  }
  return outputRange.start;
}

/**
 * @private
 * Gets aminoAcid data, including position in string and position in codon
 * from the sequenceString and the direction of the translation
 * @param  {String} sequenceString The dna sequenceString.
 * @param  {boolean} forward Should we find forward facing orfs or reverse facing orfs
 * @param  {boolean} isProteinSequence We're passing in a sequence of AA chars instead of DNA chars (slightly confusing but we'll still use the dna indexing for rendering in OVE)
 * @return [{
        aminoAcid:
        positionInCodon:
      }]
 */
export default function getAminoAcidDataForEachBaseOfDna(
  originalSequenceString,
  forward,
  optionalSubrangeRange,
  isProteinSequence
) {
  if (!originalSequenceString) {
    return [];
  }
  // Obtain derived properties, see getTranslatedSequenceProperties
  const {
    sequenceString,
    translationRange,
    sequenceStringLength,
    originalSequenceStringLength,
    exonRange
  } = getTranslatedSequenceProperties(
    originalSequenceString,
    forward,
    optionalSubrangeRange,
    isProteinSequence
  );

  const aminoAcidDataForEachBaseOfDNA = [];

  // Iterate over the DNA sequence length in increments of 3
  for (let index = 0; index < sequenceStringLength; index += 3) {
    let aminoAcid;
    const aminoAcidIndex = Math.floor(index / 3);
    let codonPositionsInCDS;
    let basesRead;

    if (isProteinSequence) {
      codonPositionsInCDS = [0, 1, 2].map(i => index + i);
      basesRead = 3;
      aminoAcid = proteinAlphabet[sequenceString[index / 3].toUpperCase()];
    } else {
      // Get the triplet of DNA bases
      const {
        triplet,
        basesRead: _basesRead,
        codonPositions
      } = getNextTriplet(index, sequenceString, exonRange);
      basesRead = _basesRead;
      codonPositionsInCDS = codonPositions;
      // If the triplet is not full, we need to add the gap xxx amino acid, start
      aminoAcid = triplet.length === 3 ? getAA(triplet) : getAA("xxx");
    }

    const absoluteCodonPositions = codonPositionsInCDS.map(i =>
      positionInCdsToPositionInMainSequence(
        i,
        forward,
        translationRange,
        originalSequenceStringLength
      )
    );

    // What should the codon range be if it comprises intron bases?
    const codonRange = forward
      ? {
          start: absoluteCodonPositions[0],
          end: absoluteCodonPositions[codonPositionsInCDS.length - 1]
        }
      : {
          start: absoluteCodonPositions[codonPositionsInCDS.length - 1],
          end: absoluteCodonPositions[0]
        };

    // Iterate over the positions read
    let positionInCodon = 0;
    for (let i = 0; i < basesRead; i++) {
      const posInCds = i + index;
      const sequenceIndex = codonPositionsInCDS.includes(posInCds)
        ? absoluteCodonPositions[codonPositionsInCDS.indexOf(posInCds)]
        : positionInCdsToPositionInMainSequence(
            posInCds,
            forward,
            translationRange,
            originalSequenceStringLength
          );
      if (codonPositionsInCDS.includes(posInCds)) {
        aminoAcidDataForEachBaseOfDNA.push({
          aminoAcid,
          positionInCodon,
          aminoAcidIndex,
          sequenceIndex,
          codonRange,
          fullCodon: codonPositionsInCDS.length === 3
        });
        positionInCodon++;
      } else {
        // push a null object for intron bases
        aminoAcidDataForEachBaseOfDNA.push({
          aminoAcid: null,
          positionInCodon: null,
          aminoAcidIndex: null,
          sequenceIndex,
          codonRange: null,
          fullCodon: null
        });
      }
    }
    // Move the index in case intron bases were read
    index += basesRead - codonPositionsInCDS.length;
  }

  if (sequenceStringLength !== aminoAcidDataForEachBaseOfDNA.length) {
    throw new Error("something went wrong!");
  }

  // Reverse the array if we're translating in the reverse direction
  if (!forward) {
    aminoAcidDataForEachBaseOfDNA.reverse();
  }
  return aminoAcidDataForEachBaseOfDNA;
}
