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
    const allNonTemplateBases = nonTemplates.map(seq => seq[i]);
    const bases = [templateBase, ...allNonTemplateBases];

    // Only consider tracks whose aligned region covers position i.
    // Using `some` here would classify a position as a gap whenever any single
    // track hasn't started or has ended, swamping real differences from other
    // tracks that ARE aligned (critical for multi-read Sanger alignments).
    const alignedIndices = trackBounds.reduce((acc, { start, end }, idx) => {
      if (i >= start && i < end) acc.push(idx);
      return acc;
    }, []);

    if (alignedIndices.length === 0) {
      differences.push({ position: i, type: "gap", bases });
      continue;
    }

    const alignedBases = alignedIndices.map(idx => allNonTemplateBases[idx]);
    const templateIsGap = templateBase === "-";
    const nonTemplateHasBase = alignedBases.some(b => b !== "-");
    const nonTemplateHasGap = alignedBases.some(b => b === "-");

    if (templateIsGap && nonTemplateHasBase) {
      differences.push({ position: i, type: "insertion", bases });
    } else if (!templateIsGap && nonTemplateHasGap) {
      differences.push({ position: i, type: "deletion", bases });
    } else if (!templateIsGap) {
      const uniqueBases = new Set([templateBase, ...alignedBases]);
      if (uniqueBases.size > 1) {
        differences.push({ position: i, type: "mismatch", bases });
      }
    }
  }

  return differences;
}

export default findAlignmentDifferences;
