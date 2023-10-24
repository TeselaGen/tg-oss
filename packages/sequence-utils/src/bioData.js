//Adapted from biopython. Check the BIOPYTHON_LICENSE for licensing info

export const protein_letters = "ACDEFGHIKLMNPQRSTVWY";
export const protein_letters_withUandX = "ACDEFGHIKLMNPQRSTVWYUX";
export const extended_protein_letters = "ACDEFGHIKLMNPQRSTVWYBXZJUO.*-";
export const ambiguous_dna_letters = "GATCRYWSMKHBVDN";
export const unambiguous_dna_letters = "GATC";
export const ambiguous_rna_letters = "GAUCRYWSMKHBVDN";
export const unambiguous_rna_letters = "GAUC";
export const extended_dna_letters = "GATCBDSW";

export const ambiguous_dna_values = {
  ".": ".",
  A: "A",
  C: "C",
  G: "G",
  T: "T",
  M: "AC",
  R: "AG",
  W: "AT",
  S: "CG",
  Y: "CT",
  K: "GT",
  V: "ACG",
  H: "ACT",
  D: "AGT",
  B: "CGT",
  X: "GATC",
  N: "GATC"
};

export const extended_protein_values = {
  A: "A",
  B: "ND",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  H: "H",
  I: "I",
  J: "IL",
  K: "K",
  L: "L",
  M: "M",
  N: "N",
  O: "O",
  P: "P",
  Q: "Q",
  R: "R",
  S: "S",
  T: "T",
  U: "U",
  V: "V",
  W: "W",
  X: "ACDEFGHIKLMNPQRSTVWY",
  // # TODO - Include U and O in the possible values of X?
  // # This could alter the extended_protein_weight_ranges ...
  // # by MP: Won't do this, because they are so rare.
  Y: "Y",
  Z: "QE",
  "*": "\\*\\.",
  ".": "\\.\\.",
  "-": "\\-"
};
