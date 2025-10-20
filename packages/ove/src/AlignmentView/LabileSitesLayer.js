import React from "react";

/**
 * Draws vertical lines at specified libile site position.
 *
 * @param {Object} props
 * @param {number} leftMargin - Width of the name column.
 * @param {number} charWidth - Width of each character in the alignment.
 * @param {number} sequenceLength - Number of columns in the alignment.
 * @param {number} numTracks - Number of alignment tracks (rows).
 * @param {number[]} positionsToMark - Array of 0-based column indices to mark.
 * @param {number} rowHeight - Height of each alignment row (default: 24).
 */
const LabileSitesLayer = ({ leftMargin, charWidth, positionsToMark = [] }) => {
  return (
    <div className="veLabileSites">
      {positionsToMark?.map((pos, i) => {
        const x = leftMargin + (pos - 1.2) * charWidth + charWidth / 2;
        return (
          <div
            className="veAlignmentViewLabileSiteLine"
            key={i}
            style={{
              left: x
            }}
          />
        );
      })}
    </div>
  );
};

export default LabileSitesLayer;
