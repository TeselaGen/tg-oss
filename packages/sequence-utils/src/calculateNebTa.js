const calculateTm = require("./calculateNebTm");

module.exports = function calculateNebTa(
  sequences,
  primerConc,
  { monovalentCationConc, polymerase } = {}
) {
  try {
    if (sequences.length !== 2) {
      throw new Error(
        `${sequences.length} sequences received when 2 primers were expected`
      );
    }
    const meltingTemperatures = sequences.map(seq =>
      calculateTm(seq, primerConc, { monovalentCationConc })
    );
    meltingTemperatures.sort((a, b) => a - b);
    const lowerMeltingTemp = meltingTemperatures[0];
    let annealingTemp;
    if (polymerase === "Q5") {
      // Ta = Tm_lower+1°C is standard for Q5
      annealingTemp = lowerMeltingTemp + 1;
      if (annealingTemp > 72) {
        // "Annealing temperature for experiments with this enzyme should typically not exceed 72°C"
        annealingTemp = 72;
      }
    } else {
      annealingTemp = lowerMeltingTemp - 3;
    }
    return annealingTemp;
  } catch (err) {
    return `Error calculating annealing temperature: ${err}`;
  }
};
