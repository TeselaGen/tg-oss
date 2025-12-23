//

export default function trimNumberToFitWithin0ToAnotherNumber(
  numberToBeTrimmed: number,
  max: number
) {
  if (numberToBeTrimmed < 0) {
    numberToBeTrimmed = 0;
  }
  if (numberToBeTrimmed > max) {
    numberToBeTrimmed = max;
  }
  return numberToBeTrimmed;
}
