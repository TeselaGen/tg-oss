export default LabileSitesLayer;
/**
 * Draws vertical lines at specified labile site position.
 *
 * @param {Object} props
 * @param {number} leftMargin - Width of the name column.
 * @param {number} charWidth - Width of each character in the alignment.
 * @param {number} sequenceLength - Number of columns in the alignment.
 * @param {number} numTracks - Number of alignment tracks (rows).
 * @param {number[]} positionsToMark - Array of 0-based column indices to mark.
 * @param {number} rowHeight - Height of each alignment row (default: 24).
 */
declare function LabileSitesLayer({ leftMargin, charWidth, positionsToMark }: Object): import("react/jsx-runtime").JSX.Element;
