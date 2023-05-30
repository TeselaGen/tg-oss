const getComplementSequenceString = require("./getComplementSequenceString");
const calculatePercentGc = require("./calculatePercentGC");

// sources of formulas:
// - https://tmcalculator.neb.com/#!/help
// - Tm calculation: SantaLucia (1998) PNAS 95:1460-5
// - salt correction (for monovalent cations): Owczarzy (2004) Biochem 43:3537-54

// primer concentration & monovalent cation concentration in M
module.exports = function calculateNebTm(
  sequence,
  primerConc,
  { monovalentCationConc } = {}
) {
  try {
    const checkForDegenerateBases = /[^atgc]/i.test(sequence);
    if (checkForDegenerateBases) {
      throw new Error(
        `Degenerate bases prohibited in Tm calculation of sequence ${sequence}`
      );
    }
    const seq = sequence.toUpperCase().split("");
    // enthalpy, entropy
    let h = 0;
    let s = 0;
    // adjustments for helix initiation
    let hi = 0;
    let si = 0;
    // R = universal gas constant with units of cal/(K*mol)
    const r = 1.987;
    // to convert the units of Tm from kelvin to celsius and vice versa
    const kelvinToCelsius = -273.15;
    const celsiusToKelvin = 273.15;
    // to convert the units of enthalpy from kilocal/mol to cal/mol
    const kilocalToCal = 1000;
    const sequenceToEnthalpyMap = {
      "AA/TT": -7.9,
      "AT/TA": -7.2,
      "TA/AT": -7.2,
      "CA/GT": -8.5,
      "GT/CA": -8.4,
      "CT/GA": -7.8,
      "GA/CT": -8.2,
      "CG/GC": -10.6,
      "GC/CG": -9.8,
      "GG/CC": -8.0,
      "TT/AA": -7.9,
      "TG/AC": -8.5,
      "AC/TG": -8.4,
      "AG/TC": -7.8,
      "TC/AG": -8.2,
      "CC/GG": -8.0,
      initiationWithTerminalGC: 0.1,
      initiationWithTerminalAT: 2.3
    };
    const sequenceToEntropyMap = {
      "AA/TT": -22.2,
      "AT/TA": -20.4,
      "TA/AT": -21.3,
      "CA/GT": -22.7,
      "GT/CA": -22.4,
      "CT/GA": -21.0,
      "GA/CT": -22.2,
      "CG/GC": -27.2,
      "GC/CG": -24.4,
      "GG/CC": -19.9,
      "TT/AA": -22.2,
      "TG/AC": -22.7,
      "AC/TG": -22.4,
      "AG/TC": -21.0,
      "TC/AG": -22.2,
      "CC/GG": -19.9,
      initiationWithTerminalGC: -2.8,
      initiationWithTerminalAT: 4.1
    };
    for (let i = 0; i < seq.length; i++) {
      if (i === 0 || i === seq.length - 1) {
        // first or last nucleotide
        if (seq[i] === "G" || seq[i] === "C") {
          hi += sequenceToEnthalpyMap.initiationWithTerminalGC;
          si += sequenceToEntropyMap.initiationWithTerminalGC;
        } else if (seq[i] === "A" || seq[i] === "T") {
          hi += sequenceToEnthalpyMap.initiationWithTerminalAT;
          si += sequenceToEntropyMap.initiationWithTerminalAT;
        }
      }
      if (i < seq.length - 1) {
        const dimer = seq[i] + seq[i + 1];
        const complement = getComplementSequenceString(dimer).toUpperCase();
        const dimerDuplex = `${dimer}/${complement}`;
        if (
          !sequenceToEnthalpyMap[dimerDuplex] ||
          !sequenceToEntropyMap[dimerDuplex]
        ) {
          throw new Error(
            `Could not find value for ${dimerDuplex} of sequence ${sequence}`
          );
        }
        h += sequenceToEnthalpyMap[dimerDuplex];
        s += sequenceToEntropyMap[dimerDuplex];
      }
    }
    // this calculated Tm assumes 1 M monovalent cation concentration
    const deltaH = h + hi;
    const deltaS = s + si;
    const numerator = deltaH * kilocalToCal;
    const denominator = deltaS + r * Math.log(primerConc);
    const meltingTemp = numerator / denominator + kelvinToCelsius;
    if (monovalentCationConc) {
      // adjusting Tm for actual monovalent cation concentration
      const lnOfMonoConc = Math.log(monovalentCationConc);
      const gcContent = calculatePercentGc(sequence) / 100;
      const part = 4.29 * gcContent - 3.95;
      const saltCorrection =
        part * Math.pow(10, -5) * lnOfMonoConc +
        Math.pow(9.4, -6) * Math.pow(lnOfMonoConc, 2);
      const adjustedMeltingTemp =
        1 / (1 / (meltingTemp + celsiusToKelvin) + saltCorrection) +
        kelvinToCelsius;
      return adjustedMeltingTemp;
    } else {
      return meltingTemp;
    }
  } catch (err) {
    return `Error calculating Tm for sequence ${sequence}: ${err}`;
  }
};
