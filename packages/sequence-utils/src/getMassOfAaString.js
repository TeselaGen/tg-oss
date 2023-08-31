import proteinAlphabet from "./proteinAlphabet";

/**
 * @param {string} aaString A string of amino acid characters
 * @param {number} numsAfterDecimal the number of digits to round to after the decimal point, must be greater than 0
 * @param {boolean} divideByThree divide the final mass by three,
 *  this is useful in situtations where nucelotides are converted to
 *  amino acids in a way that the amino acid appears three times
 * @returns The sum of the mass of all amino acids in the string
 */
export default function getMassOfAaString(
  aaString,
  numsAfterDecimal = 2,
  divideByThree = false
) {
  let sumMass = 0;
  for (let i = 0; i < aaString.length; i++) {
    sumMass += proteinAlphabet[aaString[i]].mass;
  }
  if (divideByThree) {
    sumMass /= 3;
  }
  return Math.round(sumMass * 10 ** numsAfterDecimal) / 10 ** numsAfterDecimal;
}
