/* eslint-disable eqeqeq */
/**
 * DNA melting temperature calculator.
 * @author Nick Elsbree
 * @author Zinovii Dmytriv (original author)
 */
const calcTmMethods = {
  TABLE_BRESLAUER: "breslauer",
  TABLE_SUGIMOTO: "sugimoto",
  TABLE_UNIFIED: "unified",

  A: -10.8, // Helix initiation for deltaS
  R: 1.987, // Gas constant (cal/(K*mol)).
  primerConc: 0.0000005, // Oligo concentration. 0.5uM is typical for PCR.
  monovalentCationConc: 0.05, // Monovalent salt concentration. 50mM is typical for PCR.

  /**
   * Calculates temperature for DNA sequence using a given algorithm.
   * sequence - The DNA sequence to use.
   * type - Either Teselagen.bio.tools.TemperatureCalculator.TABLE_BRESLAUER, TABLE_SUGIMOTO, or TABLE_UNIFIED
   * A - Helix initation for deltaS. Defaults to -10.8.
   * R - The gas constant, in cal/(K*mol). Defaults to 0.5e-6M.
   * monovalentCationConc - THe monovalent salt concentration. Defaults to 50e-3M.
   * return - Temperature for the given sequence, in Celsius.
   */
  calculateTemperature: function (
    _sequence,
    { type, A, R, primerConc, monovalentCationConc } = {}
  ) {
    const sequence = (_sequence || "").toLowerCase();
    if (typeof type === "undefined") {
      // type = this.TABLE_SUGIMOTO  ;
      // type = this.TABLE_UNIFIED;
      type = this.TABLE_BRESLAUER;
    } else if (
      type != this.TABLE_BRESLAUER &&
      type != this.TABLE_UNIFIED &&
      type != this.TABLE_SUGIMOTO
    ) {
      throw new Error("Invalid table type!");
    }

    if (!A) {
      A = this.A;
    }
    if (!R) {
      R = this.R;
    }
    if (!primerConc) {
      primerConc = this.primerConc;
    }
    if (!monovalentCationConc) {
      monovalentCationConc = this.monovalentCationConc;
    }

    const sequenceLength = sequence.length;

    if (sequenceLength == 0) {
      return 0;
    }

    const deltaHTable = this.getDeltaHTable(type);
    const deltaSTable = this.getDeltaSTable(type);

    const neighbors = []; // List goes in order: aa, at, ac, ag, tt, ta, tc, tg, cc, ca, ct, cg, gg, ga, gt, gc

    neighbors.push(this.calculateReps(sequence, "aa"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "at"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "ac"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "ag"));

    neighbors.push(this.calculateReps(sequence, "tt"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "ta"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "tc"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "tg"));

    neighbors.push(this.calculateReps(sequence, "cc"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "ca"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "ct"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "cg"));

    neighbors.push(this.calculateReps(sequence, "gg"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "ga"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "gt"));
    neighbors.push(this.calculateNumberOfOccurrences(sequence, "gc"));

    let sumDeltaH = 0.0;
    let sumDeltaS = 0.0;

    for (let i = 0; i < 16; i++) {
      sumDeltaH = sumDeltaH + neighbors[i] * deltaHTable[i];
      sumDeltaS = sumDeltaS + neighbors[i] * deltaSTable[i];
    }

    const temperature =
      (-1000.0 * sumDeltaH) /
        (A + -sumDeltaS + R * Math.log(primerConc / 4.0)) -
      273.15 +
      16.6 * Math.LOG10E * Math.log(monovalentCationConc);

    return temperature;
  },

  /**
   * @private
   * Function to return deltaH table for given algorithm.
   * @param {String} type Algorithm to get table for.
   * @return {Number[]} deltaH table for given algorithm.
   */
  getDeltaHTable: function (type) {
    if (type == this.TABLE_BRESLAUER) {
      return [
        9.1, 8.6, 6.5, 7.8, 9.1, 6.0, 5.6, 5.8, 11.0, 5.8, 7.8, 11.9, 11.0, 5.6,
        6.5, 11.1
      ];
    } else if (type == this.TABLE_SUGIMOTO) {
      return [
        8.0, 5.6, 6.5, 7.8, 8.0, 5.6, 5.6, 5.8, 10.9, 8.2, 6.6, 11.8, 10.9, 6.6,
        9.4, 11.9
      ];
    } else if (type == this.TABLE_UNIFIED) {
      return [
        7.9, 7.2, 8.4, 7.8, 7.9, 7.2, 8.2, 8.5, 8.0, 8.5, 7.8, 10.6, 8.0, 8.2,
        8.4, 9.8
      ];
    } else {
      return null;
    }
  },
  // "AA/TT": -7.9, 7.9
  // "AT/TA": -7.2, 7.2
  // "AC/TG": -8.4, 8.4
  // "AG/TC": -7.8, 7.8
  // "TT/AA": -7.9, 7.9
  // "TA/AT": -7.2, 7.2
  // "TG/AC": -8.5, 8.2
  // "TC/AG": -8.2, 8.5
  // "CC/GG": -8.0, 8.0
  // "CA/GT": -8.5, 8.5
  // "CT/GA": -7.8, 7.8
  // "CG/GC": -10.6, 10.6
  // "GG/CC": -8.0, 8.0
  // "GA/CT": -8.2, 8.2,
  // "GT/CA": -8.4, 8.4
  // "GC/CG": -9.8, 9.8

  // aa, at, ac, ag, tt, ta, tc, tg, cc, ca, ct, cg, gg, ga, gt, gc

  // "AA/TT": -22.2,22.2,
  // "AT/TA": -20.4,20.4,
  // "AC/TG": -22.4,22.4,
  // "AG/TC": -21.0,21.0,
  // "TT/AA": -22.2,22.2,
  // "TA/AT": -21.3,21.3,
  // "TC/AG": -22.2,22.2,
  // "TG/AC": -22.7,22.7,
  // "CC/GG": -19.9,19.9,
  // "CA/GT": -22.7,22.7,
  // "CT/GA": -21.0,21.0,
  // "CG/GC": -27.2,27.2,
  // "GG/CC": -19.9,19.9,
  // "GT/CA": -22.4,22.2,
  // "GA/CT": -22.2,22.4,
  // "GC/CG": -24.4,24.4

  /**
   * @private
   * Function to return deltaS table for given algorithm.
   * @param {String} type Algorithm to get table for.
   * @return {Number[]} deltaS table for given algorithm.
   */
  getDeltaSTable: function (type) {
    if (type == this.TABLE_BRESLAUER) {
      return [
        24.0, 23.9, 17.3, 20.8, 24.0, 16.9, 13.5, 12.9, 26.6, 12.9, 20.8, 27.8,
        26.6, 13.5, 17.3, 26.7
      ];
    } else if (type == this.TABLE_SUGIMOTO) {
      return [
        21.9, 15.2, 17.3, 20.8, 21.9, 15.2, 13.5, 12.9, 28.4, 25.5, 23.5, 29.0,
        28.4, 16.4, 25.5, 29.0
      ];
    } else if (type == this.TABLE_UNIFIED) {
      return [
        22.2, 20.4, 22.4, 21.0, 22.2, 21.3, 22.2, 22.7, 19.9, 22.7, 21.0, 27.2,
        19.9, 22.2, 22.4, 24.4
      ];
    } else {
      return null;
    }
  },

  /**
   * @private
   * Finds number of occurrences of target in sequence.
   * Will find repeating sequences, meaning that
   * calculateReps("aaa", "aa") returns 2 rather than 1.
   * @param  {String} sequence The string to search through.
   * @param  {String} target   The string to search for.
   * @return {Int} Number of occurrences of target in sequence, with repeats.
   */
  calculateReps: function (sequence, target) {
    const sequenceLength = sequence.length;

    if (sequenceLength == 0) {
      return 0;
    }

    let numFound = 0;
    let seqOffset = 0; // Search offset for finding multiple matches.

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const foundSeq = sequence.indexOf(target, seqOffset);

      if (foundSeq == -1) {
        break;
      }

      seqOffset = foundSeq + 1;
      numFound++;

      if (seqOffset > sequenceLength) {
        break;
      }
    }

    return numFound;
  },

  /**
   * @private
   * Counts number of occurrences of target in sequence, without repeating.
   * @param  {String} sequence The string to search through.
   * @param  {String} target   The string to search for.
   * @return {Int} Number of occurrences of target in sequence.
   */
  calculateNumberOfOccurrences: function (sequence, target) {
    const sequenceLength = sequence.length;

    if (sequenceLength == 0) {
      return 0;
    }

    const numberFound = sequence.split(target).length - 1;

    return numberFound;
  }
};

export default calcTmMethods.calculateTemperature.bind(calcTmMethods);
