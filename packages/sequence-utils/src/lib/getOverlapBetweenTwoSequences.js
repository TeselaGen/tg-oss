import {modulatePositionByRange} from "@teselagen/range-utils";

/**
 * This function gets the overlapping of one sequence to another based on sequence equality.
 *
 * @param  {string} sequenceToFind
 * @param  {string} sequenceToSearchIn
 * @param  {object} options            optional
 * @return {object || null}            null if no overlap exists or a range object with .start and .end properties
 */
export default function getOverlapBetweenTwoSequences(
  sequenceToFind,
  sequenceToSearchIn,
  options
) {
  options = options || {};
  sequenceToSearchIn = sequenceToSearchIn.toLowerCase();
  sequenceToFind = sequenceToFind.toLowerCase();
  const lengthenedSeqToSearch = sequenceToSearchIn + sequenceToSearchIn;
  const index = lengthenedSeqToSearch.indexOf(sequenceToFind);
  if (index > -1) {
    return {
      start: index,
      end: modulatePositionByRange(index + sequenceToFind.length - 1, {
        start: 0,
        end: sequenceToSearchIn.length - 1
      })
    };
  } else {
    return null;
  }
};
