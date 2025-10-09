import { debounce, uniq } from "lodash-es";
import {
  ambiguous_dna_letters,
  ambiguous_rna_letters,
  extended_protein_letters
} from "./bioData";

let allWarnings = [];

let makeToast = () => {
  if (typeof window !== "undefined" && window.toastr && allWarnings.length) {
    window.toastr.warning(uniq(allWarnings).join("\n"));
  }
  allWarnings = [];
};

makeToast = debounce(makeToast, 200);

function showWarnings(warnings) {
  allWarnings = allWarnings.concat(warnings);
  makeToast.cancel();
  makeToast();
}

export default function filterSequenceString(
  sequenceString = "",
  {
    additionalValidChars = "",
    isOligo,
    name,
    isProtein,
    isRna,
    isMixedRnaAndDna
  } = {}
) {
  const acceptedChars = getAcceptedChars({
    isOligo,
    isProtein,
    isRna,
    isMixedRnaAndDna
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
      }Invalid character(s) detected and removed: ${uniq(invalidChars)
        .map(c => {
          if (c === " ") {
            return "space";
          }
          return c;
        })
        .slice(0, 100)
        .join(", ")} `
    );
  }
  showWarnings(warnings);

  return [sanitizedVal, warnings];
}

export function getAcceptedChars({
  isOligo,
  isProtein,
  isRna,
  isMixedRnaAndDna
} = {}) {
  return isProtein
    ? `${extended_protein_letters.toLowerCase()}`
    : isOligo
      ? ambiguous_rna_letters.toLowerCase() + "t"
      : isRna
        ? ambiguous_rna_letters.toLowerCase() + "t"
        : isMixedRnaAndDna
          ? ambiguous_rna_letters.toLowerCase() +
            ambiguous_dna_letters.toLowerCase()
          : //just plain old dna
            ambiguous_dna_letters.toLowerCase();
}
export function getReplaceChars({
  isOligo,
  isProtein,
  isRna,
  isMixedRnaAndDna
} = {}) {
  return isProtein
    ? {}
    : // {".": "*"}
      isOligo
      ? {}
      : isRna
        ? { t: "u" }
        : isMixedRnaAndDna
          ? {}
          : //just plain old dna
            {};
}

export const filterRnaString = (s, o) =>
  filterSequenceString(s, { ...o, isRna: true })[0];
