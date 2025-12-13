import {
  isValidSequence,
  SANTA_LUCIA_NN,
  SANTA_LUCIA_INIT
} from "./calculateSantaLuciaTm";

/**
 * Calculate End Stability (3' end stability) of a primer
 *
 * The maximum stability for the last five 3' bases of a left or right primer.
 * Bigger numbers mean more stable 3' ends. The value is the maximum delta G
 * (kcal/mol) for duplex disruption for the five 3' bases.
 *
 * According to Primer3 documentation:
 * - Most stable 5mer duplex: GCGCG = 6.86 kcal/mol (SantaLucia 1998)
 * - Most labile 5mer duplex: TATAT = 0.86 kcal/mol (SantaLucia 1998)
 *
 * @param {string} sequence - DNA sequence (5' to 3')
 * @returns {number} - Delta G (kcal/mol) for the last 5 bases at 3' end
 * @throws {Error} Invalid sequence or too short.
 */
export default function calculateEndStability(sequence) {
  try {
    sequence = sequence?.toUpperCase().trim();

    if (!isValidSequence(sequence)) {
      throw new Error("Invalid sequence: contains non-DNA characters");
    }

    if (sequence.length < 5) {
      throw new Error(
        "Sequence too short: minimum length is 5 bases for end stability calculation"
      );
    }

    const last5Bases = sequence.substring(sequence.length - 5);

    let deltaH = 0; // kcal/mol
    let deltaS = 0; // cal/K·mol

    // Calculate nearest-neighbor contributions for the 4 dinucleotides
    for (let i = 0; i < 4; i++) {
      const dinucleotide = last5Bases.substring(i, i + 2);

      if (dinucleotide.includes("N")) {
        continue;
      }

      const params = SANTA_LUCIA_NN[dinucleotide];
      if (params) {
        deltaH += params.dH;
        deltaS += params.dS;
      }
    }

    // Add initiation parameters for terminal base pairs
    const firstBase = last5Bases[0];
    const lastBase = last5Bases[last5Bases.length - 1];

    // Terminal GC or AT initiation
    if (firstBase === "G" || firstBase === "C") {
      deltaH += SANTA_LUCIA_INIT.GC.dH;
      deltaS += SANTA_LUCIA_INIT.GC.dS;
    } else {
      deltaH += SANTA_LUCIA_INIT.AT.dH;
      deltaS += SANTA_LUCIA_INIT.AT.dS;
    }

    if (lastBase === "G" || lastBase === "C") {
      deltaH += SANTA_LUCIA_INIT.GC.dH;
      deltaS += SANTA_LUCIA_INIT.GC.dS;
    } else {
      deltaH += SANTA_LUCIA_INIT.AT.dH;
      deltaS += SANTA_LUCIA_INIT.AT.dS;
    }

    // Calculate deltaG at 37°C (310.15 K)
    // deltaG = deltaH - T * deltaS
    const T = 310.15; // 37°C in Kelvin
    const deltaG = deltaH - (T * deltaS) / 1000; // Result in kcal/mol

    return Math.round(Math.abs(deltaG) * 100) / 100;
  } catch (e) {
    return `Error calculating end stability for sequence ${sequence}. ${e}`;
  }
}
