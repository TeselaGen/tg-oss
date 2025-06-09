/**
 * Copyright (c) 2025 by TeselaGen Biotechnology Inc.
 * This JavaScript implementation is based on the Python Biopython module, durrently released under the "Biopython License Agreement" (given in full below).
 * 
 * Biopython License Agreement
 * Permission to use, copy, modify, and distribute this software and its documentation with or without modifications and for any purpose and without fee is hereby granted, provided that any copyright notices appear in all copies and that both those copyright notices and this permission notice appear in supporting documentation, and that the names of the contributors or copyright holders not be used in advertising or publicity pertaining to distribution of the software without specific prior permission.
 * THE CONTRIBUTORS AND COPYRIGHT HOLDERS OF THIS SOFTWARE DISCLAIM ALL WARRANTIES WITH REGARD TO THIS SOFTWARE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS, IN NO EVENT SHALL THE CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */

/**
 * Calculate the melting temperature of nucleotide sequences.
 *
 * This module contains three different methods to calculate the melting
 * temperature of oligonucleotides:
 *
 * 1. Tm_Wallace: 'Rule of thumb'
 * 2. Tm_GC: Empirical formulas based on GC content. Salt and mismatch corrections
 *    can be included.
 * 3. Tm_NN: Calculation based on nearest neighbor thermodynamics. Several tables
 *    for DNA/DNA, DNA/RNA and RNA/RNA hybridizations are included.
 *    Correction for mismatches, dangling ends, salt concentration and other
 *    additives are available.
 *
 * General parameters for most Tm methods:
 *  - seq -- A sequence string.
 *  - check -- Checks if the sequence is valid for the given method (default=
 *    true). In general, whitespaces and non-base characters are removed and
 *    characters are converted to uppercase. RNA will be backtranscribed.
 *  - strict -- Do not allow base characters or neighbor duplex keys (e.g.
 *    'AT/NA') that could not or not unambiguously be evaluated for the respective
 *    method (default=true). Note that W (= A or T) and S (= C or G) are not
 *    ambiguous for Tm_Wallace and Tm_GC. If 'false', average values (if
 *    applicable) will be used.
 *
 * This module is not able to detect self-complementary and it will not use
 * alignment tools to align an oligonucleotide sequence to its target sequence.
 * Thus it can not detect dangling-ends and mismatches by itself (don't even think
 * about bulbs and loops). These parameters have to be handed over to the
 * respective method.
 *
 * Other public methods of this module:
 *  - make_table     : To create a table with thermodynamic data.
 *  - salt_correction: To adjust Tm to a given salt concentration by different
 *    formulas. This method is called from Tm_GC and Tm_NN but may
 *    also be accessed 'manually'. It returns a correction term, not
 *    a corrected Tm!
 *  - chem_correction: To adjust Tm regarding the chemical additives DMSO and
 *    formaldehyde. The method returns a corrected Tm. Chemical
 *    correction is not an integral part of the Tm methods and must
 *    be called additionally.
 */

// Thermodynamic lookup tables (objects):
// Enthalpy (dH) and entropy (dS) values for nearest neighbors and initiation
// process. Calculation of duplex initiation is quite different in several
// papers; to allow for a general calculation, all different initiation
// parameters are included in all tables and non-applicable parameters are set
// to zero.
// The key is either an initiation type (e.g., 'init_A/T') or a nearest neighbor
// duplex sequence (e.g., GT/CA, to read 5'GT3'-3'CA5'). The values are arrays
// of dH (kcal/mol), dS (cal/mol K).

// DNA/DNA
// Breslauer et al. (1986), Proc Natl Acad Sci USA 83: 3746-3750
const DNA_NN1 = {
    "init": [0, 0], "init_A/T": [0, 0], "init_G/C": [0, 0],
    "init_oneG/C": [0, -16.8], "init_allA/T": [0, -20.1], "init_5T/A": [0, 0],
    "sym": [0, -1.3],
    "AA/TT": [-9.1, -24.0], "AT/TA": [-8.6, -23.9], "TA/AT": [-6.0, -16.9],
    "CA/GT": [-5.8, -12.9], "GT/CA": [-6.5, -17.3], "CT/GA": [-7.8, -20.8],
    "GA/CT": [-5.6, -13.5], "CG/GC": [-11.9, -27.8], "GC/CG": [-11.1, -26.7],
    "GG/CC": [-11.0, -26.6]
};

// Sugimoto et al. (1996), Nuc Acids Res 24 : 4501-4505
const DNA_NN2 = {
    "init": [0.6, -9.0], "init_A/T": [0, 0], "init_G/C": [0, 0],
    "init_oneG/C": [0, 0], "init_allA/T": [0, 0], "init_5T/A": [0, 0],
    "sym": [0, -1.4],
    "AA/TT": [-8.0, -21.9], "AT/TA": [-5.6, -15.2], "TA/AT": [-6.6, -18.4],
    "CA/GT": [-8.2, -21.0], "GT/CA": [-9.4, -25.5], "CT/GA": [-6.6, -16.4],
    "GA/CT": [-8.8, -23.5], "CG/GC": [-11.8, -29.0], "GC/CG": [-10.5, -26.4],
    "GG/CC": [-10.9, -28.4]
};

// Allawi and SantaLucia (1997), Biochemistry 36: 10581-10594
const DNA_NN3 = {
    "init": [0, 0], "init_A/T": [2.3, 4.1], "init_G/C": [0.1, -2.8],
    "init_oneG/C": [0, 0], "init_allA/T": [0, 0], "init_5T/A": [0, 0],
    "sym": [0, -1.4],
    "AA/TT": [-7.9, -22.2], "AT/TA": [-7.2, -20.4], "TA/AT": [-7.2, -21.3],
    "CA/GT": [-8.5, -22.7], "GT/CA": [-8.4, -22.4], "CT/GA": [-7.8, -21.0],
    "GA/CT": [-8.2, -22.2], "CG/GC": [-10.6, -27.2], "GC/CG": [-9.8, -24.4],
    "GG/CC": [-8.0, -19.9]
};

// SantaLucia & Hicks (2004), Annu. Rev. Biophys. Biomol. Struct 33: 415-440
const DNA_NN4 = {
    "init": [0.2, -5.7], "init_A/T": [2.2, 6.9], "init_G/C": [0, 0],
    "init_oneG/C": [0, 0], "init_allA/T": [0, 0], "init_5T/A": [0, 0],
    "sym": [0, -1.4],
    "AA/TT": [-7.6, -21.3], "AT/TA": [-7.2, -20.4], "TA/AT": [-7.2, -21.3],
    "CA/GT": [-8.5, -22.7], "GT/CA": [-8.4, -22.4], "CT/GA": [-7.8, -21.0],
    "GA/CT": [-8.2, -22.2], "CG/GC": [-10.6, -27.2], "GC/CG": [-9.8, -24.4],
    "GG/CC": [-8.0, -19.9]
};

// RNA/RNA
// Freier et al. (1986), Proc Natl Acad Sci USA 83: 9373-9377
const RNA_NN1 = {
    "init": [0, -10.8], "init_A/T": [0, 0], "init_G/C": [0, 0],
    "init_oneG/C": [0, 0], "init_allA/T": [0, 0], "init_5T/A": [0, 0],
    "sym": [0, -1.4],
    "AA/TT": [-6.6, -18.4], "AT/TA": [-5.7, -15.5], "TA/AT": [-8.1, -22.6],
    "CA/GT": [-10.5, -27.8], "GT/CA": [-10.2, -26.2], "CT/GA": [-7.6, -19.2],
    "GA/CT": [-13.3, -35.5], "CG/GC": [-8.0, -19.4], "GC/CG": [-14.2, -34.9],
    "GG/CC": [-12.2, -29.7]
};

// Xia et al (1998), Biochemistry 37: 14719-14735
const RNA_NN2 = {
    "init": [3.61, -1.5], "init_A/T": [3.72, 10.5], "init_G/C": [0, 0],
    "init_oneG/C": [0, 0], "init_allA/T": [0, 0], "init_5T/A": [0, 0],
    "sym": [0, -1.4],
    "AA/TT": [-6.82, -19.0], "AT/TA": [-9.38, -26.7], "TA/AT": [-7.69, -20.5],
    "CA/GT": [-10.44, -26.9], "GT/CA": [-11.40, -29.5],
    "CT/GA": [-10.48, -27.1], "GA/CT": [-12.44, -32.5],
    "CG/GC": [-10.64, -26.7], "GC/CG": [-14.88, -36.9],
    "GG/CC": [-13.39, -32.7]
};

// Chen et al. (2012), Biochemistry 51: 3508-3522
const RNA_NN3 = {
    "init": [6.40, 6.99], "init_A/T": [3.85, 11.04], "init_G/C": [0, 0],
    "init_oneG/C": [0, 0], "init_allA/T": [0, 0], "init_5T/A": [0, 0],
    "sym": [0, -1.4],
    "AA/TT": [-7.09, -19.8], "AT/TA": [-9.11, -25.8], "TA/AT": [-8.50, -22.9],
    "CA/GT": [-11.03, -28.8], "GT/CA": [-11.98, -31.3],
    "CT/GA": [-10.90, -28.5], "GA/CT": [-13.21, -34.9],
    "CG/GC": [-10.88, -27.4], "GC/CG": [-16.04, -40.6],
    "GG/CC": [-14.18, -35.0], "GT/TG": [-13.83, -46.9],
    "GG/TT": [-17.82, -56.7], "AG/TT": [-3.96, -11.6],
    "TG/AT": [-0.96, -1.8], "TT/AG": [-10.38, -31.8], "TG/GT": [-12.64, -38.9],
    "AT/TG": [-7.39, -21.0], "CG/GT": [-5.56, -13.9], "CT/GG": [-9.44, -24.7],
    "GG/CT": [-7.03, -16.8], "GT/CG": [-11.09, -28.8]
};

// RNA/DNA
// Sugimoto et al. (1995), Biochemistry 34: 11211-11216
const R_DNA_NN1 = {
    "init": [1.9, -3.9], "init_A/T": [0, 0], "init_G/C": [0, 0],
    "init_oneG/C": [0, 0], "init_allA/T": [0, 0], "init_5T/A": [0, 0],
    "sym": [0, 0],
    "TT/AA": [-11.5, -36.4], "GT/CA": [-7.8, -21.6], "CT/GA": [-7.0, -19.7],
    "AT/TA": [-8.3, -23.9], "TG/AC": [-10.4, -28.4], "GG/CC": [-12.8, -31.9],
    "CG/GC": [-16.3, -47.1], "AG/TC": [-9.1, -23.5], "TC/AG": [-8.6, -22.9],
    "GC/CG": [-8.0, -17.1], "CC/GG": [-9.3, -23.2], "AC/TG": [-5.9, -12.3],
    "TA/AT": [-7.8, -23.2], "GA/CT": [-5.5, -13.5], "CA/GT": [-9.0, -26.1],
    "AA/TT": [-7.8, -21.9]
};

// Internal mismatch and inosine table (DNA)
// Allawi & SantaLucia (1997), Biochemistry 36: 10581-10594
// Allawi & SantaLucia (1998), Biochemistry 37: 9435-9444
// Allawi & SantaLucia (1998), Biochemistry 37: 2170-2179
// Allawi & SantaLucia (1998), Nucl Acids Res 26: 2694-2701
// Peyret et al. (1999), Biochemistry 38: 3468-3477
// Watkins & SantaLucia (2005), Nucl Acids Res 33: 6258-6267
const DNA_IMM1 = {
    "AG/TT": [1.0, 0.9], "AT/TG": [-2.5, -8.3], "CG/GT": [-4.1, -11.7],
    "CT/GG": [-2.8, -8.0], "GG/CT": [3.3, 10.4], "GG/TT": [5.8, 16.3],
    "GT/CG": [-4.4, -12.3], "GT/TG": [4.1, 9.5], "TG/AT": [-0.1, -1.7],
    "TG/GT": [-1.4, -6.2], "TT/AG": [-1.3, -5.3], "AA/TG": [-0.6, -2.3],
    "AG/TA": [-0.7, -2.3], "CA/GG": [-0.7, -2.3], "CG/GA": [-4.0, -13.2],
    "GA/CG": [-0.6, -1.0], "GG/CA": [0.5, 3.2], "TA/AG": [0.7, 0.7],
    "TG/AA": [3.0, 7.4],
    "AC/TT": [0.7, 0.2], "AT/TC": [-1.2, -6.2], "CC/GT": [-0.8, -4.5],
    "CT/GC": [-1.5, -6.1], "GC/CT": [2.3, 5.4], "GT/CC": [5.2, 13.5],
    "TC/AT": [1.2, 0.7], "TT/AC": [1.0, 0.7],
    "AA/TC": [2.3, 4.6], "AC/TA": [5.3, 14.6], "CA/GC": [1.9, 3.7],
    "CC/GA": [0.6, -0.6], "GA/CC": [5.2, 14.2], "GC/CA": [-0.7, -3.8],
    "TA/AC": [3.4, 8.0], "TC/AA": [7.6, 20.2],
    "AA/TA": [1.2, 1.7], "CA/GA": [-0.9, -4.2], "GA/CA": [-2.9, -9.8],
    "TA/AA": [4.7, 12.9], "AC/TC": [0.0, -4.4], "CC/GC": [-1.5, -7.2],
    "GC/CC": [3.6, 8.9], "TC/AC": [6.1, 16.4], "AG/TG": [-3.1, -9.5],
    "CG/GG": [-4.9, -15.3], "GG/CG": [-6.0, -15.8], "TG/AG": [1.6, 3.6],
    "AT/TT": [-2.7, -10.8], "CT/GT": [-5.0, -15.8], "GT/CT": [-2.2, -8.4],
    "TT/AT": [0.2, -1.5],
    "AI/TC": [-8.9, -25.5], "TI/AC": [-5.9, -17.4], "AC/TI": [-8.8, -25.4],
    "TC/AI": [-4.9, -13.9], "CI/GC": [-5.4, -13.7], "GI/CC": [-6.8, -19.1],
    "CC/GI": [-8.3, -23.8], "GC/CI": [-5.0, -12.6],
    "AI/TA": [-8.3, -25.0], "TI/AA": [-3.4, -11.2], "AA/TI": [-0.7, -2.6],
    "TA/AI": [-1.3, -4.6], "CI/GA": [2.6, 8.9], "GI/CA": [-7.8, -21.1],
    "CA/GI": [-7.0, -20.0], "GA/CI": [-7.6, -20.2],
    "AI/TT": [0.49, -0.7], "TI/AT": [-6.5, -22.0], "AT/TI": [-5.6, -18.7],
    "TT/AI": [-0.8, -4.3], "CI/GT": [-1.0, -2.4], "GI/CT": [-3.5, -10.6],
    "CT/GI": [0.1, -1.0], "GT/CI": [-4.3, -12.1],
    "AI/TG": [-4.9, -15.8], "TI/AG": [-1.9, -8.5], "AG/TI": [0.1, -1.8],
    "TG/AI": [1.0, 1.0], "CI/GG": [7.1, 21.3], "GI/CG": [-1.1, -3.2],
    "CG/GI": [5.8, 16.9], "GG/CI": [-7.6, -22.0],
    "AI/TI": [-3.3, -11.9], "TI/AI": [0.1, -2.3], "CI/GI": [1.3, 3.0],
    "GI/CI": [-0.5, -1.3]
};

// Terminal mismatch table (DNA)
// SantaLucia & Peyret (2001) Patent Application WO 01/94611
const DNA_TMM1 = {
    "AA/TA": [-3.1, -7.8], "TA/AA": [-2.5, -6.3], "CA/GA": [-4.3, -10.7],
    "GA/CA": [-8.0, -22.5],
    "AC/TC": [-0.1, 0.5], "TC/AC": [-0.7, -1.3], "CC/GC": [-2.1, -5.1],
    "GC/CC": [-3.9, -10.6],
    "AG/TG": [-1.1, -2.1], "TG/AG": [-1.1, -2.7], "CG/GG": [-3.8, -9.5],
    "GG/CG": [-0.7, -19.2],
    "AT/TT": [-2.4, -6.5], "TT/AT": [-3.2, -8.9], "CT/GT": [-6.1, -16.9],
    "GT/CT": [-7.4, -21.2],
    "AA/TC": [-1.6, -4.0], "AC/TA": [-1.8, -3.8], "CA/GC": [-2.6, -5.9],
    "CC/GA": [-2.7, -6.0], "GA/CC": [-5.0, -13.8], "GC/CA": [-3.2, -7.1],
    "TA/AC": [-2.3, -5.9], "TC/AA": [-2.7, -7.0],
    "AC/TT": [-0.9, -1.7], "AT/TC": [-2.3, -6.3], "CC/GT": [-3.2, -8.0],
    "CT/GC": [-3.9, -10.6], "GC/CT": [-4.9, -13.5], "GT/CC": [-3.0, -7.8],
    "TC/AT": [-2.5, -6.3], "TT/AC": [-0.7, -1.2],
    "AA/TG": [-1.9, -4.4], "AG/TA": [-2.5, -5.9], "CA/GG": [-3.9, -9.6],
    "CG/GA": [-6.0, -15.5], "GA/CG": [-4.3, -11.1], "GG/CA": [-4.6, -11.4],
    "TA/AG": [-2.0, -4.7], "TG/AA": [-2.4, -5.8],
    "AG/TT": [-3.2, -8.7], "AT/TG": [-3.5, -9.4], "CG/GT": [-3.8, -9.0],
    "CT/GG": [-6.6, -18.7], "GG/CT": [-5.7, -15.9], "GT/CG": [-5.9, -16.1],
    "TG/AT": [-3.9, -10.5], "TT/AG": [-3.6, -9.8]
};

// Dangling ends table (DNA)
// Bommarito et al. (2000), Nucl Acids Res 28: 1929-1934
const DNA_DE1 = {
    "AA/.T": [0.2, 2.3], "AC/.G": [-6.3, -17.1], "AG/.C": [-3.7, -10.0],
    "AT/.A": [-2.9, -7.6], "CA/.T": [0.6, 3.3], "CC/.G": [-4.4, -12.6],
    "CG/.C": [-4.0, -11.9], "CT/.A": [-4.1, -13.0], "GA/.T": [-1.1, -1.6],
    "GC/.G": [-5.1, -14.0], "GG/.C": [-3.9, -10.9], "GT/.A": [-4.2, -15.0],
    "TA/.T": [-6.9, -20.0], "TC/.G": [-4.0, -10.9], "TG/.C": [-4.9, -13.8],
    "TT/.A": [-0.2, -0.5],
    ".A/AT": [-0.7, -0.8], ".C/AG": [-2.1, -3.9], ".G/AC": [-5.9, -16.5],
    ".T/AA": [-0.5, -1.1], ".A/CT": [4.4, 14.9], ".C/CG": [-0.2, -0.1],
    ".G/CC": [-2.6, -7.4], ".T/CA": [4.7, 14.2], ".A/GT": [-1.6, -3.6],
    ".C/GG": [-3.9, -11.2], ".G/GC": [-3.2, -10.4], ".T/GA": [-4.1, -13.1],
    ".A/TT": [2.9, 10.4], ".C/TG": [-4.4, -13.1], ".G/TC": [-5.2, -15.0],
    ".T/TA": [-3.8, -12.6]
};

// Dangling ends table (RNA)
// Turner & Mathews (2010), Nucl Acids Res 38: D280-D282
const RNA_DE1 = {
    ".T/AA": [-4.9, -13.2], ".T/CA": [-0.9, -1.3], ".T/GA": [-5.5, -15.1],
    ".T/TA": [-2.3, -5.5],
    ".G/AC": [-9.0, -23.5], ".G/CC": [-4.1, -10.6], ".G/GC": [-8.6, -22.2],
    ".G/TC": [-7.5, -20.31],
    ".C/AG": [-7.4, -20.3], ".C/CG": [-2.8, -7.7], ".C/GG": [-6.4, -16.4],
    ".C/TG": [-3.6, -9.7],
    ".T/AG": [-4.9, -13.2], ".T/CG": [-0.9, -1.3], ".T/GG": [-5.5, -15.1],
    ".T/TG": [-2.3, -5.5],
    ".A/AT": [-5.7, -16.1], ".A/CT": [-0.7, -1.9], ".A/GT": [-5.8, -16.4],
    ".A/TT": [-2.2, -6.8],
    ".G/AT": [-5.7, -16.1], ".G/CT": [-0.7, -1.9], ".G/GT": [-5.8, -16.4],
    ".G/TT": [-2.2, -6.8],
    "AT/.A": [-0.5, -0.6], "CT/.A": [6.9, 22.6], "GT/.A": [0.6, 2.6],
    "TT/.A": [0.6, 2.6],
    "AG/.C": [-1.6, -4.5], "CG/.C": [0.7, 3.2], "GG/.C": [-4.6, -14.8],
    "TG/.C": [-0.4, -1.3],
    "AC/.G": [-2.4, -6.1], "CC/.G": [3.3, 11.6], "GC/.G": [0.8, 3.2],
    "TC/.G": [-1.4, -4.2],
    "AT/.G": [-0.5, -0.6], "CT/.G": [6.9, 22.6], "GT/.G": [0.6, 2.6],
    "TT/.G": [0.6, 2.6],
    "AA/.T": [1.6, 6.1], "CA/.T": [2.2, 8.1], "GA/.T": [0.7, 3.5],
    "TA/.T": [3.1, 10.6],
    "AG/.T": [1.6, 6.1], "CG/.T": [2.2, 8.1], "GG/.T": [0.7, 3.5],
    "TG/.T": [3.1, 10.6]
};

/**
 * Return a table with thermodynamic parameters (as object).
 *
 * @param {Object} oldtable - An existing object with thermodynamic parameters.
 * @param {Object} values - An object with new or updated values.
 * @returns {Object} A new table with thermodynamic parameters.
 *
 * Example:
 * To replace the initiation parameters in the Sugimoto '96 dataset with
 * the initiation parameters from Allawi & SantaLucia '97:
 *
 * const table = DNA_NN2;                               // Sugimoto '96
 * console.log(table['init_A/T']);                      // [0, 0]
 * const newtable = make_table(DNA_NN2, {'init': [0, 0],
 *                             'init_A/T': [2.3, 4.1],
 *                             'init_G/C': [0.1, -2.8]});
 * console.log(newtable['init_A/T']);                   // [2.3, 4.1]
 */
function make_table(oldtable = null, values = null) {
    let table;
    if (oldtable === null) {
        table = {
            "init": [0, 0],
            "init_A/T": [0, 0],
            "init_G/C": [0, 0],
            "init_oneG/C": [0, 0],
            "init_allA/T": [0, 0],
            "init_5T/A": [0, 0],
            "sym": [0, 0],
            "AA/TT": [0, 0],
            "AT/TA": [0, 0],
            "TA/AT": [0, 0],
            "CA/GT": [0, 0],
            "GT/CA": [0, 0],
            "CT/GA": [0, 0],
            "GA/CT": [0, 0],
            "CG/GC": [0, 0],
            "GC/CG": [0, 0],
            "GG/CC": [0, 0]
        };
    } else {
        table = { ...oldtable };
    }
    if (values) {
        Object.assign(table, values);
    }
    return table;
}

/**
 * Return a sequence which fulfills the requirements of the given method.
 *
 * All Tm methods in this package require the sequence in uppercase format.
 * Most methods make use of the length of the sequence (directly or
 * indirectly), which can only be expressed as seq.length if the sequence does
 * not contain whitespaces and other non-base characters. RNA sequences are
 * backtranscribed to DNA.
 *
 * @param {string} seq - The sequence as given by the user.
 * @param {string} method - Tm_Wallace, Tm_GC or Tm_NN.
 * @returns {string} A sequence which fulfills the requirements of the given method.
 *
 * Example:
 * _check('10 ACGTTGCAAG tccatggtac', 'Tm_NN')
 * // Returns: 'ACGTTGCAAGTCCATGGTAC'
 */
function _check(seq, method) {
    // Remove whitespace and convert to uppercase
    seq = seq.replace(/\s+/g, '').toUpperCase();
    
    // Back-transcribe RNA to DNA (replace U with T)
    seq = seq.replace(/U/g, 'T');
    
    if (method === "Tm_Wallace") {
        return seq;
    }
    
    let baseset;
    if (method === "Tm_GC") {
        baseset = new Set("ABCDGHIKMNRSTVWXY".split(''));
    }
    if (method === "Tm_NN") {
        baseset = new Set("ACGTI".split(''));
    }
    
    // Filter sequence to only include valid bases
    seq = seq.split('').filter(base => baseset.has(base)).join('');
    return seq;
}


/**
 * JavaScript implementation of melting temperature calculations for nucleotide sequences.
 * Translated from the Python Biopython module.
 */

/**
 * Calculate a term to correct Tm for salt ions.
 * 
 * Depending on the Tm calculation, the term will correct Tm or entropy. To
 * calculate corrected Tm values, different operations need to be applied:
 * 
 *  - methods 1-4: Tm(new) = Tm(old) + corr
 *  - method 5: deltaS(new) = deltaS(old) + corr
 *  - methods 6+7: Tm(new) = 1/(1/Tm(old) + corr)
 * 
 * @param {Object} options - Options for salt correction
 * @param {number} [options.Na=0] - Millimolar concentration of Na+ ion
 * @param {number} [options.K=0] - Millimolar concentration of K+ ion
 * @param {number} [options.Tris=0] - Millimolar concentration of Tris
 * @param {number} [options.Mg=0] - Millimolar concentration of Mg2+ ion
 * @param {number} [options.dNTPs=0] - Millimolar concentration of dNTPs
 * @param {number} [options.method=1] - Method to be applied (1-7)
 * @param {string} [options.seq=null] - Sequence (needed for methods 5-7)
 * @returns {number} - The correction term
 */
function salt_correction({ Na = 0, K = 0, Tris = 0, Mg = 0, dNTPs = 0, method = 1, seq = null } = {}) {
    if ((method === 5 || method === 6 || method === 7) && !seq) {
        throw new Error("sequence is missing (is needed to calculate GC content or sequence length).");
    }
    
    let corr = 0;
    if (!method) {
        return corr;
    }
    
    // Note: all these values are millimolar
    let Mon = Na + K + Tris / 2.0;
    
    // Lowercase ions (mg, mon, dntps) are molar
    let mg = Mg * 1e-3;
    
    // Na equivalent according to von Ahsen et al. (2001):
    if ((K + Mg + Tris + dNTPs) > 0 && method !== 7 && dNTPs < Mg) {
        // dNTPs bind Mg2+ strongly. If [dNTPs] is larger or equal than
        // [Mg2+], free Mg2+ is considered not to be relevant.
        Mon += 120 * Math.sqrt(Mg - dNTPs);
    }
    
    let mon = Mon * 1e-3;
    
    // Note: Math.log = ln(), Math.log10 = log()
    if (method >= 1 && method <= 6 && !mon) {
        throw new Error("Total ion concentration of zero is not allowed in this method.");
    }
    
    if (method === 1) {
        corr = 16.6 * Math.log10(mon);
    }
    if (method === 2) {
        corr = 16.6 * Math.log10(mon / (1.0 + 0.7 * mon));
    }
    if (method === 3) {
        corr = 12.5 * Math.log10(mon);
    }
    if (method === 4) {
        corr = 11.7 * Math.log10(mon);
    }
    if (method === 5) {
        corr = 0.368 * (seq.length - 1) * Math.log(mon);
    }
    if (method === 6) {
        corr = (4.29 * gc_fraction(seq, "ignore") - 3.95) * 1e-5 * Math.log(mon) + 9.40e-6 * Math.log(mon) ** 2;
    }
    if (method === 7) {
        let a = 3.92, b = -0.911, c = 6.26, d = 1.42;
        let e = -48.2, f = 52.5, g = 8.31;
        
        if (dNTPs > 0) {
            let dntps = dNTPs * 1e-3;
            let ka = 3e4;  // Dissociation constant for Mg:dNTP
            
            // Free Mg2+ calculation:
            mg = (-(ka * dntps - ka * mg + 1.0) + 
                 Math.sqrt((ka * dntps - ka * mg + 1.0) ** 2 + 4.0 * ka * mg)) / (2.0 * ka);
        }
        
        if (Mon > 0) {
            let R = Math.sqrt(mg) / mon;
            
            if (R < 0.22) {
                corr = (4.29 * gc_fraction(seq, "ignore") - 3.95) * 1e-5 * Math.log(mon) + 9.40e-6 * Math.log(mon) ** 2;
                return corr;
            } else if (R < 6.0) {
                a = 3.92 * (0.843 - 0.352 * Math.sqrt(mon) * Math.log(mon));
                d = 1.42 * (1.279 - 4.03e-3 * Math.log(mon) - 8.03e-3 * Math.log(mon) ** 2);
                g = 8.31 * (0.486 - 0.258 * Math.log(mon) + 5.25e-3 * Math.log(mon) ** 3);
            }
        }
        
        corr = (a + b * Math.log(mg) + gc_fraction(seq, "ignore") * (c + d * Math.log(mg)) + 
               (1 / (2.0 * (seq.length - 1))) * (e + f * Math.log(mg) + g * Math.log(mg) ** 2)) * 1e-5;
    }
    
    if (method > 7) {
        throw new Error("Allowed values for parameter 'method' are 1-7.");
    }
    
    return corr;
}


/**
 * Correct a given Tm for DMSO and formamide.
 * 
 * Please note that these corrections are +/- rough approximations.
 * 
 * @param {number} melting_temp - Melting temperature
 * @param {Object} options - Options for chemical correction
 * @param {number} [options.DMSO=0] - Percent DMSO
 * @param {number} [options.fmd=0] - Formamide concentration in %(fmdmethod=1) or molar (fmdmethod=2)
 * @param {number} [options.DMSOfactor=0.75] - How much should Tm decreases per percent DMSO
 * @param {number} [options.fmdfactor=0.65] - How much should Tm decrease per percent formamide
 * @param {number} [options.fmdmethod=1] - Method for formamide correction (1 or 2)
 * @param {number} [options.GC=null] - GC content in percent
 * @returns {number} - The corrected melting temperature
 */
function chem_correction(melting_temp, { DMSO = 0, fmd = 0, DMSOfactor = 0.75, fmdfactor = 0.65, fmdmethod = 1, GC = null } = {}) {
    if (DMSO) {
        melting_temp -= DMSOfactor * DMSO;
    }
    
    if (fmd) {
        // McConaughy et al. (1969), Biochemistry 8: 3289-3295
        if (fmdmethod === 1) {
            // Note: Here fmd is given in percent
            melting_temp -= fmdfactor * fmd;
        }
        // Blake & Delcourt (1996), Nucl Acids Res 11: 2095-2103
        if (fmdmethod === 2) {
            if (GC === null || GC < 0) {
                throw new Error("'GC' is missing or negative");
            }
            // Note: Here fmd is given in molar
            melting_temp += (0.453 * (GC / 100.0) - 2.88) * fmd;
        }
        if (fmdmethod !== 1 && fmdmethod !== 2) {
            throw new Error("'fmdmethod' must be 1 or 2");
        }
    }
    
    return melting_temp;
}

/**
 * Calculate and return the Tm using the 'Wallace rule'.
 * 
 * Tm = 4 degC * (G + C) + 2 degC * (A+T)
 * 
 * The Wallace rule (Thein & Wallace 1986, in Human genetic diseases: a
 * practical approach, 33-50) is often used as rule of thumb for approximate
 * Tm calculations for primers of 14 to 20 nt length.
 * 
 * Non-DNA characters (e.g., E, F, J, !, 1, etc) are ignored by this method.
 * 
 * @param {string} seq - The sequence
 * @param {boolean} [check=true] - Whether to check and process the sequence
 * @param {boolean} [strict=true] - Whether to disallow ambiguous bases
 * @returns {number} - The calculated melting temperature
 */
function Tm_Wallace(seq, check = true, strict = true) {
    seq = String(seq);
    
    if (check) {
        seq = _check(seq, "Tm_Wallace");
    }
    
    // Count occurrences of specific bases
    const countBases = (seq, bases) => {
        return bases.split('').reduce((count, base) => count + (seq.match(new RegExp(base, 'g')) || []).length, 0);
    };
    
    let melting_temp = 2 * countBases(seq, "ATW") + 4 * countBases(seq, "CGS");
    
    // Intermediate values for ambiguous positions:
    let tmp = 3 * countBases(seq, "KMNRY") + 
              10 / 3.0 * countBases(seq, "BV") + 
              8 / 3.0 * countBases(seq, "DH");
    
    if (strict && tmp) {
        throw new Error("ambiguous bases B, D, H, K, M, N, R, V, Y not allowed when strict=True");
    } else {
        melting_temp += tmp;
    }
    
    return melting_temp;
}

/**
 * Calculate the fraction of G and C bases in a sequence.
 * 
 * @param {string} seq - The sequence
 * @param {string} [method="ignore"] - Method to handle ambiguous bases
 * @returns {number} - The GC fraction (0.0 to 1.0)
 */
function gc_fraction(seq, method = "ignore") {
    seq = seq.toUpperCase();
    
    // Count unambiguous bases
    let gc = (seq.match(/[GC]/g) || []).length;
    let at = (seq.match(/[AT]/g) || []).length;
    
    // Handle ambiguous bases
    if (method === "ignore") {
        // Ignore ambiguous bases
        return gc / (gc + at) || 0;
    } else if (method === "weighted") {
        // Count ambiguous bases with appropriate weights
        let s = (seq.match(/S/g) || []).length;  // S = G or C, weight 1.0
        let w = (seq.match(/W/g) || []).length;  // W = A or T, weight 0.0
        let r = (seq.match(/R/g) || []).length;  // R = A or G, weight 0.5
        let y = (seq.match(/Y/g) || []).length;  // Y = C or T, weight 0.5
        let k = (seq.match(/K/g) || []).length;  // K = G or T, weight 0.5
        let m = (seq.match(/M/g) || []).length;  // M = A or C, weight 0.5
        let b = (seq.match(/B/g) || []).length;  // B = C or G or T, weight 0.67
        let d = (seq.match(/D/g) || []).length;  // D = A or G or T, weight 0.33
        let h = (seq.match(/H/g) || []).length;  // H = A or C or T, weight 0.33
        let v = (seq.match(/V/g) || []).length;  // V = A or C or G, weight 0.67
        let n = (seq.match(/[NX]/g) || []).length;  // N or X = any base, weight 0.5
        
        let total = gc + at + s + w + r + y + k + m + b + d + h + v + n;
        
        if (total === 0) {
            return 0;
        }
        
        return (gc + s + 0.5 * (r + y + k + m + n) + 0.67 * (b + v) + 0.33 * (d + h)) / total;
    } else {
        throw new Error(`Unknown method: ${method}`);
    }
}


/**
 * Return the Tm using empirical formulas based on GC content.
 * 
 * General format: Tm = A + B(%GC) - C/N + salt correction - D(%mismatch)
 * 
 * @param {string} seq - The sequence
 * @param {Object} options - Options for Tm calculation
 * @param {boolean} [options.check=true] - Whether to check and process the sequence
 * @param {boolean} [options.strict=true] - Whether to disallow ambiguous bases
 * @param {number} [options.valueset=7] - Which set of empirical values to use (1-8)
 * @param {Array} [options.userset=null] - Custom set of values [A, B, C, D]
 * @param {number} [options.Na=50] - Millimolar concentration of Na+ ion
 * @param {number} [options.K=0] - Millimolar concentration of K+ ion
 * @param {number} [options.Tris=0] - Millimolar concentration of Tris
 * @param {number} [options.Mg=0] - Millimolar concentration of Mg2+ ion
 * @param {number} [options.dNTPs=0] - Millimolar concentration of dNTPs
 * @param {number} [options.saltcorr=0] - Salt correction method (0-7)
 * @param {boolean} [options.mismatch=true] - Whether to count 'X' as mismatch
 * @returns {number} - The calculated melting temperature
 */
function Tm_GC(
    seq, { 
    check = true, 
    strict = true, 
    valueset = 7, 
    userset = null, 
    Na = 50, 
    K = 0, 
    Tris = 0, 
    Mg = 0, 
    dNTPs = 0, 
    saltcorr = 0, 
    mismatch = true 
    } = {}) {
    if (saltcorr === 5) {
        throw new Error("salt-correction method 5 not applicable to Tm_GC");
    }
    
    seq = String(seq);
    
    if (check) {
        seq = _check(seq, "Tm_GC");
    }
    
    if (strict && /[KMNRYBVDH]/.test(seq)) {
        throw new Error("ambiguous bases B, D, H, K, M, N, R, V, Y not allowed when 'strict=True'");
    }
    
    // Ambiguous bases: add 0.5, 0.67 or 0.33% depending on G+C probability:
    let percent_gc = gc_fraction(seq, "weighted") * 100;
    
    // gc_fraction counts X as 0.5
    if (mismatch) {
        percent_gc -= (seq.match(/X/g) || []).length * 50.0 / seq.length;
    }
    
    let A, B, C, D;
    
    if (userset) {
        [A, B, C, D] = userset;
    } else {
        if (valueset === 1) {
            [A, B, C, D] = [69.3, 0.41, 650, 1];
            saltcorr = 0;
        }
        if (valueset === 2) {
            [A, B, C, D] = [81.5, 0.41, 675, 1];
            saltcorr = 0;
        }
        if (valueset === 3) {
            [A, B, C, D] = [81.5, 0.41, 675, 1];
            saltcorr = 1;
        }
        if (valueset === 4) {
            [A, B, C, D] = [81.5, 0.41, 500, 1];
            saltcorr = 2;
        }
        if (valueset === 5) {
            [A, B, C, D] = [78.0, 0.7, 500, 1];
            saltcorr = 2;
        }
        if (valueset === 6) {
            [A, B, C, D] = [67.0, 0.8, 500, 1];
            saltcorr = 2;
        }
        if (valueset === 7) {
            [A, B, C, D] = [81.5, 0.41, 600, 1];
            saltcorr = 1;
        }
        if (valueset === 8) {
            [A, B, C, D] = [77.1, 0.41, 528, 1];
            saltcorr = 4;
        }
    }
    
    if (valueset > 8) {
        throw new Error("allowed values for parameter 'valueset' are 0-8.");
    }
    
    let melting_temp = A + B * percent_gc - C / seq.length;
    
    if (saltcorr) {
        melting_temp += salt_correction({ 
            Na: Na, 
            K: K, 
            Tris: Tris, 
            Mg: Mg, 
            dNTPs: dNTPs, 
            seq: seq, 
            method: saltcorr 
        });
    }
    
    if (mismatch) {
        melting_temp -= D * ((seq.match(/X/g) || []).length * 100.0 / seq.length);
    }
    
    return melting_temp;
}

/**
 * Throw an error or a warning if there is no data for the neighbors (PRIVATE).
 * 
 * @param {string} neighbors - The neighbor key
 * @param {boolean} strict - Whether to throw an error (true) or warning (false)
 */
function _key_error(neighbors, strict) {
    // We haven't found the key in the tables
    if (strict) {
        throw new Error(`no thermodynamic data for neighbors '${neighbors}' available`);
    } else {
        console.warn(`no thermodynamic data for neighbors '${neighbors}' available. Calculation will be wrong`);
    }
}


/**
 * Return the Tm using nearest neighbor thermodynamics.
 *
 * @param {string} seq - The primer/probe sequence as string. For RNA/DNA hybridizations seq must be the RNA sequence.
 * @param {Object} options - Options for Tm calculation
 * @param {boolean} [options.check=true] - Whether to check and process the sequence
 * @param {boolean} [options.strict=true] - Whether to disallow ambiguous bases
 * @param {string} [options.c_seq=null] - Complementary sequence. The sequence of the template/target in 3'->5' direction.
 * @param {number} [options.shift=0] - Shift of the primer/probe sequence on the template/target sequence
 * @param {Object} [options.nn_table=DNA_NN3] - Thermodynamic NN values
 * @param {Object} [options.tmm_table=DNA_TMM1] - Thermodynamic values for terminal mismatches
 * @param {Object} [options.imm_table=DNA_IMM1] - Thermodynamic values for internal mismatches
 * @param {Object} [options.de_table=DNA_DE1] - Thermodynamic values for dangling ends
 * @param {number} [options.dnac1=25] - Concentration of the higher concentrated strand [nM]
 * @param {number} [options.dnac2=25] - Concentration of the lower concentrated strand [nM]
 * @param {boolean} [options.selfcomp=false] - Is the sequence self-complementary?
 * @param {number} [options.Na=50] - Millimolar concentration of Na+ ion
 * @param {number} [options.K=0] - Millimolar concentration of K+ ion
 * @param {number} [options.Tris=0] - Millimolar concentration of Tris
 * @param {number} [options.Mg=0] - Millimolar concentration of Mg2+ ion
 * @param {number} [options.dNTPs=0] - Millimolar concentration of dNTPs
 * @param {number} [options.saltcorr=5] - Salt correction method (0-7)
 * @returns {number} - The calculated melting temperature
 */
function Tm_NN(seq, {
    check = true,
    strict = true,
    c_seq = null,
    shift = 0,
    nn_table = null,
    tmm_table = null,
    imm_table = null,
    de_table = null,
    dnac1 = 25,
    dnac2 = 25,
    selfcomp = false,
    Na = 50,
    K = 0,
    Tris = 0,
    Mg = 0,
    dNTPs = 0,
    saltcorr = 5
} = {}) {
    // Set defaults
    if (!nn_table) {
        nn_table = DNA_NN3;
    }
    if (!tmm_table) {
        tmm_table = DNA_TMM1;
    }
    if (!imm_table) {
        imm_table = DNA_IMM1;
    }
    if (!de_table) {
        de_table = DNA_DE1;
    }

    seq = String(seq);
    if (!c_seq) {
        // c_seq must be provided by user if dangling ends or mismatches should
        // be taken into account. Otherwise take perfect complement.
        c_seq = complement(seq);
    }
    c_seq = String(c_seq);
    
    if (check) {
        seq = _check(seq, "Tm_NN");
        c_seq = _check(c_seq, "Tm_NN");
    }
    
    let tmp_seq = seq;
    let tmp_cseq = c_seq;
    let delta_h = 0;
    let delta_s = 0;
    const d_h = 0;  // Names for indexes
    const d_s = 1;  // 0 and 1

    //console.warn("tmp_seq and tmp_cseq are: " + tmp_seq + " / " + tmp_cseq);

    // Dangling ends?
    if (shift || seq.length !== c_seq.length) {
        // Align both sequences using the shift parameter
        if (shift > 0) {
            tmp_seq = ".".repeat(shift) + seq;
        }
        if (shift < 0) {
            tmp_cseq = ".".repeat(Math.abs(shift)) + c_seq;
        }
        if (tmp_cseq.length > tmp_seq.length) {
            tmp_seq += ".".repeat(tmp_cseq.length - tmp_seq.length);
        }
        if (tmp_cseq.length < tmp_seq.length) {
            tmp_cseq += ".".repeat(tmp_seq.length - tmp_cseq.length);
        }
        
        // Remove 'over-dangling' ends
        while (tmp_seq.startsWith("..") || tmp_cseq.startsWith("..")) {
            tmp_seq = tmp_seq.substring(1);
            tmp_cseq = tmp_cseq.substring(1);
        }
        while (tmp_seq.endsWith("..") || tmp_cseq.endsWith("..")) {
            tmp_seq = tmp_seq.substring(0, tmp_seq.length - 1);
            tmp_cseq = tmp_cseq.substring(0, tmp_cseq.length - 1);
        }
        
        // Now for the dangling ends
        if (tmp_seq.startsWith(".") || tmp_cseq.startsWith(".")) {
            const left_de = tmp_seq.substring(0, 2) + "/" + tmp_cseq.substring(0, 2);
            try {
                delta_h += de_table[left_de][d_h];
                delta_s += de_table[left_de][d_s];
            } catch (error) {
                _key_error(left_de, strict);
            }
            tmp_seq = tmp_seq.substring(1);
            tmp_cseq = tmp_cseq.substring(1);
        }
        if (tmp_seq.endsWith(".") || tmp_cseq.endsWith(".")) {
            const right_de = tmp_cseq.substring(tmp_cseq.length - 2).split('').reverse().join('') + "/" + 
                            tmp_seq.substring(tmp_seq.length - 2).split('').reverse().join('');
            try {
                delta_h += de_table[right_de][d_h];
                delta_s += de_table[right_de][d_s];
            } catch (error) {
                _key_error(right_de, strict);
            }
            tmp_seq = tmp_seq.substring(0, tmp_seq.length - 1);
            tmp_cseq = tmp_cseq.substring(0, tmp_cseq.length - 1);
        }
    }

    // Now for terminal mismatches
    const left_tmm = tmp_cseq.substring(0, 2).split('').reverse().join('') + "/" + 
                    tmp_seq.substring(0, 2).split('').reverse().join('');
    if (left_tmm in tmm_table) {
        delta_h += tmm_table[left_tmm][d_h];
        delta_s += tmm_table[left_tmm][d_s];
        tmp_seq = tmp_seq.substring(1);
        tmp_cseq = tmp_cseq.substring(1);
    }
    
    const right_tmm = tmp_seq.substring(tmp_seq.length - 2) + "/" + tmp_cseq.substring(tmp_cseq.length - 2);
    if (right_tmm in tmm_table) {
        delta_h += tmm_table[right_tmm][d_h];
        delta_s += tmm_table[right_tmm][d_s];
        tmp_seq = tmp_seq.substring(0, tmp_seq.length - 1);
        tmp_cseq = tmp_cseq.substring(0, tmp_cseq.length - 1);
    }

    // Now everything 'unusual' at the ends is handled and removed and we can
    // look at the initiation.
    // One or several of the following initiation types may apply:

    // Type: General initiation value
    delta_h += nn_table["init"][d_h];
    delta_s += nn_table["init"][d_s];

    // Type: Duplex with no (allA/T) or at least one (oneG/C) GC pair
    if (gc_fraction(seq, "ignore") === 0) {
        delta_h += nn_table["init_allA/T"][d_h];
        delta_s += nn_table["init_allA/T"][d_s];
    } else {
        delta_h += nn_table["init_oneG/C"][d_h];
        delta_s += nn_table["init_oneG/C"][d_s];
    }

    // Type: Penalty if 5' end is T
    if (seq.startsWith("T")) {
        delta_h += nn_table["init_5T/A"][d_h];
        delta_s += nn_table["init_5T/A"][d_s];
    }
    if (seq.endsWith("A")) {
        delta_h += nn_table["init_5T/A"][d_h];
        delta_s += nn_table["init_5T/A"][d_s];
    }

    // Type: Different values for G/C or A/T terminal basepairs
    const ends = seq[0] + seq[seq.length - 1];
    const AT = (ends.match(/[AT]/g) || []).length;
    const GC = (ends.match(/[GC]/g) || []).length;
    delta_h += nn_table["init_A/T"][d_h] * AT;
    delta_s += nn_table["init_A/T"][d_s] * AT;
    delta_h += nn_table["init_G/C"][d_h] * GC;
    delta_s += nn_table["init_G/C"][d_s] * GC;

    // Finally, the 'zipping'
    for (let basenumber = 0; basenumber < tmp_seq.length - 1; basenumber++) {
        const neighbors = tmp_seq.substring(basenumber, basenumber + 2) + "/" + 
                         tmp_cseq.substring(basenumber, basenumber + 2);
        
        if (neighbors in imm_table) {
            delta_h += imm_table[neighbors][d_h];
            delta_s += imm_table[neighbors][d_s];
        } else if (neighbors.split('').reverse().join('') in imm_table) {
            delta_h += imm_table[neighbors.split('').reverse().join('')][d_h];
            delta_s += imm_table[neighbors.split('').reverse().join('')][d_s];
        } else if (neighbors in nn_table) {
            delta_h += nn_table[neighbors][d_h];
            delta_s += nn_table[neighbors][d_s];
        } else if (neighbors.split('').reverse().join('') in nn_table) {
            delta_h += nn_table[neighbors.split('').reverse().join('')][d_h];
            delta_s += nn_table[neighbors.split('').reverse().join('')][d_s];
        } else {
            // We haven't found the key...
            //console.warn('nn_table:', nn_table);
            console.warn(`We haven't found the key '${neighbors}' in the thermodynamic tables.`);
            _key_error(neighbors, strict);
        }
    }

    let k = (dnac1 - (dnac2 / 2.0)) * 1e-9;
    if (selfcomp) {
        k = dnac1 * 1e-9;
        delta_h += nn_table["sym"][d_h];
        delta_s += nn_table["sym"][d_s];
    }
    
    const R = 1.987;  // universal gas constant in Cal/degrees C*Mol
    let corr = 0;
    
    if (saltcorr) {
        corr = salt_correction({
            Na: Na,
            K: K,
            Tris: Tris,
            Mg: Mg,
            dNTPs: dNTPs,
            method: saltcorr,
            seq: seq
        });
    }
    
    if (saltcorr === 5) {
        delta_s += corr;
    }
    
    let melting_temp = (1000 * delta_h) / (delta_s + (R * (Math.log(k)))) - 273.15;
    
    if (saltcorr >= 1 && saltcorr <= 4) {
        melting_temp += corr;
    }
    
    if (saltcorr === 6 || saltcorr === 7) {
        // Tm = 1/(1/Tm + corr)
        melting_temp = 1 / (1 / (melting_temp + 273.15) + corr) - 273.15;
    }

    return melting_temp;
}

/**
 * Return the complement of a DNA sequence.
 * 
 * @param {string} seq - The DNA sequence
 * @returns {string} - The complementary sequence
 */
function complement(seq) {
    return seq.split('').map(base => {
        switch (base) {
            case 'A': return 'T';
            case 'C': return 'G';
            case 'G': return 'C';
            case 'T': return 'A';
            case 'I': return 'C'; // Inosine pairs with C
            default: return base;
        }
    }).join('');
}


function rnaXia1998Tm(seq, options = {}) {
    return Tm_NN(seq, { ...options, nn_table: RNA_NN2 });
}

function idtAllawi1997Tm(seq, options = {}) {
    return Tm_NN(seq, { ...options, nn_table: DNA_NN3 });
}

function breslauer1986Tm(seq, options = {}) {
    return Tm_NN(seq, { ...options, nn_table: DNA_NN1 });
}

function nebSantaLucia1998Tm(seq, options = {}) {
  //what do we put here? 
}

export {
    idtAllawi1997Tm,
    rnaXia1998Tm,
    breslauer1986Tm,
    nebSantaLucia1998Tm
}