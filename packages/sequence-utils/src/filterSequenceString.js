import {
  ambiguous_dna_letters,
  ambiguous_rna_letters,
  protein_letters_withUandX
} from "./bioData";

export default function filterSequenceString(
  sequenceString,
  {
    additionalValidChars = "",
    isOligo,
    name,
    isProtein,
    isRna,
    isMixedRnaAndDna,
    includeStopCodon
  } = {}
) {
  const acceptedChars = getAcceptedChars({
    isOligo,
    isProtein,
    isRna,
    isMixedRnaAndDna,
    includeStopCodon
  });
  const replaceChars = getReplaceChars({
    isOligo,
    isProtein,
    isRna,
    isMixedRnaAndDna
  });

  let sanitizedVal = "";
  const invalidChars = [];
  const chars = `${acceptedChars}${additionalValidChars.split("").join("\\")}`;
  const warnings = [];
  const replaceCount = {};
  sequenceString.split("").forEach(letter => {
    const lowerLetter = letter.toLowerCase();
    if (replaceChars && replaceChars[lowerLetter]) {
      if (!replaceCount[lowerLetter]) {
        replaceCount[lowerLetter] = 0;
      }
      replaceCount[lowerLetter]++;
      const isUpper = lowerLetter !== letter;
      sanitizedVal += isUpper
        ? replaceChars[lowerLetter].toUpperCase()
        : replaceChars[lowerLetter];
    } else if (chars.includes(lowerLetter)) {
      sanitizedVal += letter;
    } else {
      invalidChars.push(letter);
    }
  });
  //add replace count warnings
  Object.keys(replaceCount).forEach(letter => {
    warnings.push(
      `Replaced "${letter}" with "${replaceChars[letter]}"${
        replaceCount[letter] > 1 ? ` ${replaceCount[letter]} times` : ""
      }`
    );
  });
  if (sequenceString.length !== sanitizedVal.length) {
    warnings.push(
      `${
        name ? `Sequence ${name}: ` : ""
      }Invalid character(s) detected and removed: ${invalidChars
        .slice(0, 100)
        .join(", ")} `
    );
  }
  if (typeof window !== "undefined" && window.toastr && warnings.length) {
    warnings.forEach(warning => {
      window.toastr.warning(warning);
    });
  }

  return [sanitizedVal, warnings];
}

export function getAcceptedChars({
  isOligo,
  isProtein,
  isRna,
  isMixedRnaAndDna,
  includeStopCodon
} = {}) {
  return isProtein
    ? `${protein_letters_withUandX.toLowerCase()}${
        includeStopCodon ? "*." : ""
      }}`
    : isOligo
    ? ambiguous_rna_letters.toLowerCase() + "t"
    : isRna
    ? ambiguous_rna_letters.toLowerCase() + "t"
    : isMixedRnaAndDna
    ? ambiguous_rna_letters.toLowerCase() + ambiguous_dna_letters.toLowerCase()
    : //just plain old dna
      ambiguous_rna_letters.toLowerCase() + ambiguous_dna_letters.toLowerCase();
}
export function getReplaceChars({
  isOligo,
  isProtein,
  isRna,
  isMixedRnaAndDna
} = {}) {
  return isProtein
    ? {}
    : isOligo
    ? {}
    : isRna
    ? { t: "u" }
    : isMixedRnaAndDna
    ? {}
    : //just plain old dna
      {};
}