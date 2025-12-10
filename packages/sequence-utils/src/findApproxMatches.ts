/**
 * Find approximate matches of a search sequence within a target sequence
 *
 * @param {string} searchSeq - The sequence to search for
 * @param {string} targetSeq - The sequence to search within
 * @param {number} maxMismatches - Maximum number of mismatches allowed
 * @param {boolean} circular - Whether to treat the target sequence as circular (default: false)
 * @returns {Array} - Array of objects containing { index, match, mismatchPositions }
 */
export default function findApproxMatches(
  searchSeq,
  targetSeq,
  maxMismatches,
  circular = false
) {
  const matches = [];
  const lenA = searchSeq.length;
  const lenB = targetSeq.length;

  // Extend targetSeq to simulate circularity, in case circular = true
  const targetSeqExtended = circular
    ? targetSeq + targetSeq.slice(0, lenA - 1)
    : targetSeq;
  const limit = circular ? lenB : lenB - lenA + 1;

  for (let i = 0; i < limit; i++) {
    const window = targetSeqExtended.slice(i, i + lenA);
    let mismatchCount = 0;
    const mismatchPositions = [];

    for (let j = 0; j < lenA; j++) {
      if (searchSeq[j] !== window[j]) {
        mismatchPositions.push(j);
        mismatchCount++;
        if (mismatchCount > maxMismatches) break;
      }
    }

    if (mismatchCount <= maxMismatches) {
      matches.push({
        index: i,
        match: window,
        mismatchPositions,
        numMismatches: mismatchPositions.length // Keep for backwards compatibility
      });
    }
  }

  return matches;
}
