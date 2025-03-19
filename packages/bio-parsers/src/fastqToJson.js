import { convertBasePosTraceToPerBpTrace } from "./ab1ToJson.js";
import splitStringIntoLines from "./utils/splitStringIntoLines.js";
import validateSequenceArray from "./utils/validateSequenceArray";

/**
 * parses a fasta file that may or may not contain multiple resultArray
 * @param  {[string]} fileString   [string respresentation of file contents]
 * @param  {[function]} onFileParsed [callback for a parsed sequence]
 * @author Joshua P Nixon
 */

function validateFastqSet(header, sequence, plusSign, quality) {
  if (header[0] !== "@") {
    throw new Error("Invalid FASTQ format: header must start with @");
  }
  if (plusSign !== "+") {
    throw new Error("Invalid FASTQ format: plus sign must be +");
  }
  if (quality.length !== sequence.length) {
    throw new Error(
      "Invalid FASTQ format: quality and sequence must be the same length"
    );
  }
  if (quality.split("").some(char => char < "!")) {
    throw new Error("Invalid FASTQ format: quality must be at least !");
  }
  if (!/^[acgt]+$/i.test(sequence)) {
    throw new Error("Invalid FASTQ format: sequence must only contain ACGT");
  }
}

function fastqToJson(fileString, options = {}) {
  options.isProtein = false;

  const lines = splitStringIntoLines(fileString);
  const resultArray = [];
  // We could check if the number of lines is divisible by 4,
  // but maybe the file is not properly terminated.
  for (let i = 0; i + 3 < lines.length; i += 4) {
    const header = lines[i];
    const sequence = lines[i + 1];
    const plusSign = lines[i + 2];
    const quality = lines[i + 3];

    validateFastqSet(header, sequence, plusSign, quality);

    const newChromatogramData = convertBasePosTraceToPerBpTrace({
      aTrace: [],
      tTrace: [],
      gTrace: [],
      cTrace: [],
      basePos: [],
      baseCalls: sequence.split(""),
      baseTraces: sequence.split("").map(() => ({
        aTrace: [],
        tTrace: [],
        gTrace: [],
        cTrace: []
      })),
      qualNums: quality.split("").map(char => char.charCodeAt(0) - 33)
    });

    const result = {
      success: true,
      messages: [],
      parsedSequence: {
        name: header.slice(1),
        sequence: sequence,
        circular: false,
        description: "",
        chromatogramData: newChromatogramData
      }
    };
    resultArray.push(result);
  }

  return validateSequenceArray(resultArray, options);
}

export default fastqToJson;
