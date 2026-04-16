/**
 * @typedef {"mismatch"|"insertion"|"deletion"|"gap"} DifferenceType
 *
 * @typedef {Object} AlignmentDifference
 * @property {number} position - 0-based column index in the aligned sequence
 * @property {DifferenceType} type
 * @property {string[]} bases - bases at this column for each track (template first)
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
/**
 * Classify alignment columns into difference types relative to the template track.
 *
 * Template is alignedSeqs[0]. Non-template tracks are alignedSeqs[1+].
 *
 * Classification rules (per column):
 *  - "gap"       : no non-template track is in its aligned region at this position
 *  - "insertion" : template has '-', at least one aligned non-template has a non-gap base
 *  - "deletion"  : template has a non-gap base, at least one aligned non-template has '-'
 *  - "mismatch"  : no gaps among aligned tracks, unique base set has more than one member
 *
 * Only tracks whose aligned region covers position i participate in classification.
 * This correctly handles multi-read alignments (e.g. Sanger) where reads cover
 * different sub-ranges of the full alignment.
 *
 * @param {string[]} alignedSeqs - Aligned sequence strings, all same length
 * @returns {AlignmentDifference[]}
 */
export function findAlignmentDifferences(alignedSeqs: string[]): AlignmentDifference[];
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
