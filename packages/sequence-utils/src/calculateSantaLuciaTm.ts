/**
 * Primer3 Melting Temperature Calculator
 *
 * Implements the melting temperature calculation algorithm from Primer3
 * based on the documentation at https://primer3.ut.ee/primer3web_help.htm
 *
 * Uses SantaLucia (1998) nearest-neighbor thermodynamics method with
 * fixed Primer3 custom parameters:
 * - Formula: SantaLucia (1998)
 * - Salt correction: SantaLucia (1998)
 * - Monovalent salt: 50.0 mM
 * - Divalent salt: 1.5 mM
 * - dNTP concentration: 0.6 mM
 * - DNA concentration: 50.0 nM
 *
 * References:
 * - SantaLucia JR (1998) "A unified view of polymer, dumbbell and
 *   oligonucleotide DNA nearest-neighbor thermodynamics",
 *   Proc Natl Acad Sci 95:1460-65
 */

// Primer3 custom parameters (fixed)
const PRIMER3_PARAMS = {
  saltMonovalent: 50.0, // mM
  saltDivalent: 1.5, // mM
  dntpConc: 0.6, // mM
  dnaConc: 50.0, // nM
  R: 1.987 // Gas constant (cal/K·mol)
};

// SantaLucia (1998) nearest-neighbor parameters
// dH in kcal/mol, dS in cal/K·mol
export const SANTA_LUCIA_NN = {
  AA: { dH: -7.9, dS: -22.2 },
  TT: { dH: -7.9, dS: -22.2 },
  AT: { dH: -7.2, dS: -20.4 },
  TA: { dH: -7.2, dS: -21.3 },
  CA: { dH: -8.5, dS: -22.7 },
  TG: { dH: -8.5, dS: -22.7 },
  GT: { dH: -8.4, dS: -22.4 },
  AC: { dH: -8.4, dS: -22.4 },
  CT: { dH: -7.8, dS: -21.0 },
  AG: { dH: -7.8, dS: -21.0 },
  GA: { dH: -8.2, dS: -22.2 },
  TC: { dH: -8.2, dS: -22.2 },
  CG: { dH: -10.6, dS: -27.2 },
  GC: { dH: -9.8, dS: -24.4 },
  GG: { dH: -8.0, dS: -19.9 },
  CC: { dH: -8.0, dS: -19.9 }
};

// Initiation parameters (SantaLucia 1998)
export const SANTA_LUCIA_INIT = {
  GC: { dH: 0.1, dS: -2.8 }, // initiation with terminal GC
  AT: { dH: 2.3, dS: 4.1 } // initiation with terminal AT
};

/**
 * Calculate effective monovalent cation concentration
 * Accounts for divalent cations (Mg2+) binding to dNTPs
 * Formula from von Ahsen et al. (2001)
 *
 * @returns {number} - Effective monovalent concentration in mM
 */
function getEffectiveMonovalentConc() {
  let effectiveMono = PRIMER3_PARAMS.saltMonovalent;

  // Adjust for divalent cations
  if (PRIMER3_PARAMS.saltDivalent > 0) {
    const freeMg = Math.max(
      0,
      PRIMER3_PARAMS.saltDivalent - PRIMER3_PARAMS.dntpConc
    );
    effectiveMono += 120 * Math.sqrt(freeMg);
  }

  return effectiveMono;
}

/**
 * Apply SantaLucia (1998) salt correction to entropy
 *
 * @param {number} deltaS - Entropy in cal/K·mol
 * @param {number} nnPairs - Number of nearest-neighbor pairs
 * @returns {number} - Corrected entropy in cal/K·mol
 */
function applySaltCorrection(deltaS, nnPairs) {
  const effectiveMono = getEffectiveMonovalentConc();
  // SantaLucia (1998) salt correction
  return deltaS + 0.368 * nnPairs * Math.log(effectiveMono / 1000);
}

/**
 * Validate DNA sequence
 *
 * @param {string} sequence - DNA sequence
 * @returns {boolean} - True if valid
 */
export function isValidSequence(sequence) {
  return /^[ATGCN]+$/.test(sequence);
}

/**
 * Calculate melting temperature using SantaLucia (1998) method
 *
 * @param {string} sequence - DNA sequence (5' to 3')
 * @returns {number} - Melting temperature in Celsius
 * @throws {Error} Invalid sequence or too short.
 */
export default function calculateSantaLuciaTm(sequence) {
  // Convert to uppercase and validate
  try {
    sequence = sequence?.toUpperCase().trim();

    if (!isValidSequence(sequence)) {
      throw new Error("Invalid sequence: contains non-DNA characters");
    }

    if (sequence.length < 2) {
      throw new Error("Sequence too short: minimum length is 2 bases");
    }

    let deltaH = 0; // kcal/mol
    let deltaS = 0; // cal/K·mol

    // Calculate nearest-neighbor contributions
    for (let i = 0; i < sequence.length - 1; i++) {
      const dinucleotide = sequence.substring(i, i + 2);

      // Skip if contains N
      if (dinucleotide.includes("N")) {
        continue;
      }

      const params = SANTA_LUCIA_NN[dinucleotide];
      if (params) {
        deltaH += params.dH;
        deltaS += params.dS;
      }
    }

    // Add initiation parameters
    const firstBase = sequence[0];
    const lastBase = sequence[sequence.length - 1];

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

    // Apply salt correction
    const nnPairs = sequence.length - 1;
    deltaS = applySaltCorrection(deltaS, nnPairs);

    // Calculate Tm using: Tm = deltaH / (deltaS + R * ln(C/4))
    // where C is DNA concentration in M (convert from nM)
    const C = PRIMER3_PARAMS.dnaConc * 1e-9; // Convert nM to M
    const Tm = (deltaH * 1000) / (deltaS + PRIMER3_PARAMS.R * Math.log(C / 4));

    // Convert from Kelvin to Celsius
    return Tm - 273.15;
  } catch (e) {
    return `Error calculating Tm for sequence ${sequence}. ${e}`;
  }
}
