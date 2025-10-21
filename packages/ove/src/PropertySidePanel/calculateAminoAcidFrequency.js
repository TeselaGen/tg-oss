/**
 * Calculates detailed amino acid frequency, including counts and percentages for
 * all 20 standard amino acids.
 *
 * @param {string} sequence The protein sequence.
 * @returns {{
 *   totalCount: number,
 *   frequencies: Object<string, {count: number, percentage: number}>,
 *   nonStandard: Object<string, number>
 * }} A comprehensive analysis object.
 */
export function calculateAminoAcidFrequency(sequence, isProtein) {
  // 1. Validate input
  if (!sequence || typeof sequence !== "string") {
    console.warn("Invalid or empty amino acid sequence provided.");
  }

  const standards = isProtein
    ? "ACDEFGHIKLMNPQRSTVWY-".split("")
    : "ATCG-".split("");
  const frequencies = {};
  standards.forEach(a => {
    frequencies[a] = { count: 0, percentage: 0 };
  });

  const nonStandard = {}; // For gaps '-', 'X', 'B', 'Z', etc.
  let totalCount = 0;

  // 2. Iterate and count
  for (const char of sequence.toUpperCase()) {
    if (frequencies[char]) {
      frequencies[char].count++;
      totalCount++;
    } else {
      // It's a non-standard character (like a gap or 'X')
      nonStandard[char] = (nonStandard[char] || 0) + 1;
    }
  }

  // 3. Calculate percentages
  if (totalCount > 0) {
    for (const a of standards) {
      frequencies[a].percentage = (frequencies[a].count / totalCount) * 100;
    }
  }

  return {
    totalStandards: totalCount, // Total count of elements
    totalLength: sequence.length, // Total length including non-standard
    frequencies,
    nonStandard
  };
}

export const aminoAcidShortNames = {
  A: "Ala",
  C: "Cys",
  D: "Asp",
  E: "Glu",
  F: "Phe",
  G: "Gly",
  H: "His",
  I: "Ile",
  K: "Lys",
  L: "Leu",
  M: "Met",
  N: "Asn",
  P: "Pro",
  Q: "Gln",
  R: "Arg",
  S: "Ser",
  T: "Thr",
  V: "Val",
  W: "Trp",
  Y: "Tyr",
  "-": "Gaps"
};
