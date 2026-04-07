/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */

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
export function groupConsecutiveDifferences(differences) {
  const grouped = [];

  for (const diff of differences) {
    if (diff.type === "mismatch") {
      grouped.push({ ...diff, start: diff.position, end: diff.position });
      continue;
    }

    const last = grouped[grouped.length - 1];
    if (last && last.type === diff.type && last.end === diff.position - 1) {
      grouped[grouped.length - 1] = { ...last, end: diff.position };
    } else {
      grouped.push({ ...diff, start: diff.position, end: diff.position });
    }
  }

  return grouped;
}

export function findAlignmentDifferences(alignedSeqs) {
  if (alignedSeqs.length < 2 || !alignedSeqs[0]?.length) return [];

  const template = alignedSeqs[0].toLowerCase();
  const nonTemplates = alignedSeqs.slice(1).map(s => s.toLowerCase());

  // Compute non-aligned region boundaries for each non-template track.
  // Positions in [0, start) and [end, length) are non-aligned ("gap").
  const trackBounds = nonTemplates.map(seq => {
    const withoutLeading = seq.replace(/^-+/, "");
    const withoutTrailing = seq.replace(/-+$/, "");
    const start = seq.length - withoutLeading.length;
    const end = seq.length - (seq.length - withoutTrailing.length);
    return { start, end };
  });

  const differences = [];

  for (let i = 0; i < template.length; i++) {
    const templateBase = template[i];
    const nonTemplateBases = nonTemplates.map(seq => seq[i]);
    const bases = [templateBase, ...nonTemplateBases];

    // Leading/trailing non-aligned region in any non-template track
    const isNonAligned = trackBounds.some(
      ({ start, end }) => i < start || i >= end
    );
    if (isNonAligned) {
      differences.push({ position: i, type: "gap", bases });
      continue;
    }

    const templateIsGap = templateBase === "-";
    const nonTemplateHasBase = nonTemplateBases.some(b => b !== "-");
    const nonTemplateHasGap = nonTemplateBases.some(b => b === "-");

    if (templateIsGap && nonTemplateHasBase) {
      differences.push({ position: i, type: "insertion", bases });
    } else if (!templateIsGap && nonTemplateHasGap) {
      differences.push({ position: i, type: "deletion", bases });
    } else if (!templateIsGap) {
      const uniqueBases = new Set(bases);
      if (uniqueBases.size > 1) {
        differences.push({ position: i, type: "mismatch", bases });
      }
    }
  }

  return differences;
}

export default findAlignmentDifferences;
