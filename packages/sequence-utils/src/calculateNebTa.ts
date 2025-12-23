import calculateTm from "./calculateNebTm";

interface NebTaOptions {
  monovalentCationConc?: number;
  polymerase?: string;
}

export default function calculateNebTa(
  sequences: string[],
  primerConc: number,
  { monovalentCationConc, polymerase }: NebTaOptions = {}
): number | string {
  try {
    if (sequences.length !== 2) {
      throw new Error(
        `${sequences.length} sequences received when 2 primers were expected`
      );
    }
    // Type assertion or check return type of calculateTm if it can be number | string
    // Assuming calculateTm returns number | string based on previous pattern
    const meltingTemperatures = sequences.map(seq => {
      const tm = calculateTm(seq, { monovalentCationConc, primerConc });
      if (typeof tm !== "number") {
        throw new Error(`Invalid Tm calculated for ${seq}: ${tm}`);
      }
      return tm;
    });

    meltingTemperatures.sort((a, b) => a - b);
    const lowerMeltingTemp = meltingTemperatures[0];
    let annealingTemp: number;
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
}
