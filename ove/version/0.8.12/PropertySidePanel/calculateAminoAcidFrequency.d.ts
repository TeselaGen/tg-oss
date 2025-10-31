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
export function calculateAminoAcidFrequency(sequence: string, isProtein: any): {
    totalCount: number;
    frequencies: {
        [x: string]: {
            count: number;
            percentage: number;
        };
    };
    nonStandard: {
        [x: string]: number;
    };
};
export const aminoAcidShortNames: {
    A: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G: string;
    H: string;
    I: string;
    K: string;
    L: string;
    M: string;
    N: string;
    P: string;
    Q: string;
    R: string;
    S: string;
    T: string;
    V: string;
    W: string;
    Y: string;
    "-": string;
};
