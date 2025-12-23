import { debounce, uniq } from "lodash-es";
import {
  ambiguous_dna_letters,
  ambiguous_rna_letters,
  extended_protein_letters
} from "./bioData";

let allWarnings: string[] = [];

let makeToast = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== "undefined" && (window as any).toastr && allWarnings.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).toastr.warning(uniq(allWarnings).join("\n"));
  }
  allWarnings = [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(makeToast as any) = debounce(makeToast, 200);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function showWarnings(warnings: any) {
  allWarnings = allWarnings.concat(warnings);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (makeToast as any).cancel();
  makeToast();
}

interface FilterSequenceStringOptions {
  additionalValidChars?: string;
  isOligo?: boolean;
  name?: string;
  isProtein?: boolean;
  isRna?: boolean;
  isMixedRnaAndDna?: boolean;
  [key: string]: unknown;
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
  }: FilterSequenceStringOptions = {}
): [string, string[]] {
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
  const invalidChars: string[] = [];
  const chars = `${acceptedChars}${additionalValidChars.split("").join("\\")}`;
  const warnings: string[] = [];
  const replaceCount: Record<string, number> = {};
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
      `Replaced "${letter}" with "${replaceChars[letter]}"${replaceCount[letter] > 1 ? ` ${replaceCount[letter]} times` : ""
      }`
    );
  });
  if (sequenceString.length !== sanitizedVal.length) {
    warnings.push(
      `${name ? `Sequence ${name}: ` : ""
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
}: FilterSequenceStringOptions = {}) {
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
          ambiguous_rna_letters.toLowerCase() +
          ambiguous_dna_letters.toLowerCase();
}
export function getReplaceChars({
  isOligo,
  isProtein,
  isRna,
  isMixedRnaAndDna
}: FilterSequenceStringOptions = {}): Record<string, string> {
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

export const filterRnaString = (
  s: string,
  o: FilterSequenceStringOptions
): string => filterSequenceString(s, { ...o, isRna: true })[0];
