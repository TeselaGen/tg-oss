/**
 * @typedef {"mismatch"|"insertion"|"deletion"|"gap"} DifferenceType
 *
 * @typedef {Object} AlignmentDifference
 * @property {number} position - 0-based column index in the aligned sequence
 * @property {DifferenceType} type
 * @property {string[]} bases - bases at this column for each track (template first)
 */
/**
 * Classify alignment columns into difference types relative to the template track.
 *
 * Template is alignedSeqs[0]. Non-template tracks are alignedSeqs[1+].
 *
 * Classification rules (per column):
 *  - "gap"       : position is in the leading or trailing non-aligned region of
 *                  any non-template track (track hasn't started or has ended)
 *  - "insertion" : template has '-', at least one non-template has a non-gap base
 *  - "deletion"  : template has a non-gap base, at least one non-template has '-'
 *  - "mismatch"  : no gaps in any track, unique base set has more than one member
 *
 * @param {string[]} alignedSeqs - Aligned sequence strings, all same length
 * @returns {AlignmentDifference[]}
 */
/**
 * Group consecutive same-type differences into regions.
 * Mismatches are never grouped — each is its own entry.
 * Insertions, deletions, and gaps that are side-by-side are collapsed into
 * one entry with a `start` and `end` (both inclusive, 0-based).
 *
 * @param {AlignmentDifference[]} differences
 * @returns {Array<AlignmentDifference & { start: number, end: number }>}
 */
export function groupConsecutiveDifferences(differences: AlignmentDifference[]): Array<AlignmentDifference & {
    start: number;
    end: number;
}>;
export function findAlignmentDifferences(alignedSeqs: any): {
    position: number;
    type: string;
    bases: any[];
}[];
export default findAlignmentDifferences;
export type DifferenceType = "mismatch" | "insertion" | "deletion" | "gap";
export type AlignmentDifference = {
    /**
     * - 0-based column index in the aligned sequence
     */
    position: number;
    type: DifferenceType;
    /**
     * - bases at this column for each track (template first)
     */
    bases: string[];
};
