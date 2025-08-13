import proteinAlphabet from "./proteinAlphabet";

const initThreeLetterSequenceStringToAminoAcidMap = {
  gct: proteinAlphabet.A,
  gcc: proteinAlphabet.A,
  gca: proteinAlphabet.A,
  gcg: proteinAlphabet.A,
  gcu: proteinAlphabet.A,
  cgt: proteinAlphabet.R,
  cgc: proteinAlphabet.R,
  cga: proteinAlphabet.R,
  cgg: proteinAlphabet.R,
  aga: proteinAlphabet.R,
  agg: proteinAlphabet.R,
  cgu: proteinAlphabet.R,
  aat: proteinAlphabet.N,
  aac: proteinAlphabet.N,
  aau: proteinAlphabet.N,
  gat: proteinAlphabet.D,
  gac: proteinAlphabet.D,
  gau: proteinAlphabet.D,
  tgt: proteinAlphabet.C,
  tgc: proteinAlphabet.C,
  ugu: proteinAlphabet.C,
  ugc: proteinAlphabet.C,
  gaa: proteinAlphabet.E,
  gag: proteinAlphabet.E,
  caa: proteinAlphabet.Q,
  cag: proteinAlphabet.Q,
  ggt: proteinAlphabet.G,
  ggc: proteinAlphabet.G,
  gga: proteinAlphabet.G,
  ggg: proteinAlphabet.G,
  ggu: proteinAlphabet.G,
  cat: proteinAlphabet.H,
  cac: proteinAlphabet.H,
  cau: proteinAlphabet.H,
  att: proteinAlphabet.I,
  atc: proteinAlphabet.I,
  ata: proteinAlphabet.I,
  auu: proteinAlphabet.I,
  auc: proteinAlphabet.I,
  aua: proteinAlphabet.I,
  ctt: proteinAlphabet.L,
  ctc: proteinAlphabet.L,
  cta: proteinAlphabet.L,
  ctg: proteinAlphabet.L,
  tta: proteinAlphabet.L,
  ttg: proteinAlphabet.L,
  cuu: proteinAlphabet.L,
  cuc: proteinAlphabet.L,
  cua: proteinAlphabet.L,
  cug: proteinAlphabet.L,
  uua: proteinAlphabet.L,
  uug: proteinAlphabet.L,
  aaa: proteinAlphabet.K,
  aag: proteinAlphabet.K,
  atg: proteinAlphabet.M,
  aug: proteinAlphabet.M,
  ttt: proteinAlphabet.F,
  ttc: proteinAlphabet.F,
  uuu: proteinAlphabet.F,
  uuc: proteinAlphabet.F,
  cct: proteinAlphabet.P,
  ccc: proteinAlphabet.P,
  cca: proteinAlphabet.P,
  ccg: proteinAlphabet.P,
  ccu: proteinAlphabet.P,
  tct: proteinAlphabet.S,
  tcc: proteinAlphabet.S,
  tca: proteinAlphabet.S,
  tcg: proteinAlphabet.S,
  agt: proteinAlphabet.S,
  agc: proteinAlphabet.S,
  ucu: proteinAlphabet.S,
  ucc: proteinAlphabet.S,
  uca: proteinAlphabet.S,
  ucg: proteinAlphabet.S,
  agu: proteinAlphabet.S,
  act: proteinAlphabet.T,
  acc: proteinAlphabet.T,
  aca: proteinAlphabet.T,
  acg: proteinAlphabet.T,
  acu: proteinAlphabet.T,
  tgg: proteinAlphabet.W,
  ugg: proteinAlphabet.W,
  tat: proteinAlphabet.Y,
  tac: proteinAlphabet.Y,
  uau: proteinAlphabet.Y,
  uac: proteinAlphabet.Y,
  gtt: proteinAlphabet.V,
  gtc: proteinAlphabet.V,
  gta: proteinAlphabet.V,
  gtg: proteinAlphabet.V,
  guu: proteinAlphabet.V,
  guc: proteinAlphabet.V,
  gua: proteinAlphabet.V,
  gug: proteinAlphabet.V,
  taa: proteinAlphabet["*"],
  tag: proteinAlphabet["*"],
  tga: proteinAlphabet["*"],
  uaa: proteinAlphabet["*"],
  uag: proteinAlphabet["*"],
  uga: proteinAlphabet["*"],
  "...": proteinAlphabet["."],
  "---": proteinAlphabet["-"]
};

// IUPAC nucleotide codes (DNA/RNA) with U awareness
const IUPAC = {
  A: ["A"],
  C: ["C"],
  G: ["G"],
  T: ["T"],
  U: ["U"],

  R: ["A", "G"],
  Y: ["C", "T", "U"],
  K: ["G", "T", "U"],
  M: ["A", "C"],
  S: ["G", "C"],
  W: ["A", "T", "U"],
  B: ["C", "G", "T", "U"],
  D: ["A", "G", "T", "U"],
  H: ["A", "C", "T", "U"],
  V: ["A", "C", "G"],
  N: ["A", "C", "G", "T", "U"],
  X: ["A", "C", "G", "T", "U"]
};


function expandAndResolve(threeLetterCodon) {
  const chars = threeLetterCodon.toUpperCase().split("");
  const picks = chars.map((c) => IUPAC[c] || [c]);

  let allPossibleThreeLetterCodons = [""];
  for (const set of picks) {
    const next = [];
    for (const prefix of allPossibleThreeLetterCodons) for (const b of set) next.push(prefix + b);
    allPossibleThreeLetterCodons = next;
  }
  let foundAminoAcid = null;
  for (const codon of allPossibleThreeLetterCodons) {
    const lowerCodon = codon.toLowerCase();
    const aminoAcidObj = initThreeLetterSequenceStringToAminoAcidMap[lowerCodon] ?? initThreeLetterSequenceStringToAminoAcidMap[lowerCodon.replace(/u/g, "t")] ?? initThreeLetterSequenceStringToAminoAcidMap[lowerCodon.replace(/t/g, "u")];
    if (aminoAcidObj) {
      if (!foundAminoAcid) {
        foundAminoAcid = aminoAcidObj;
      } else if (foundAminoAcid.value !== aminoAcidObj.value ) {
        return null
      }
    } else {
      return null;
    }
  }
  return foundAminoAcid;
}

function getCodonToAminoAcidMap() {
  const map = initThreeLetterSequenceStringToAminoAcidMap;
  // generate all IUPAC 3-mers
  const codes = Object.keys(IUPAC);
  for (const a of codes)
    for (const b of codes)
      for (const c of codes) {
        const codon = a + b + c;
        const lowerCodon = codon.toLowerCase();
        if (map[lowerCodon]) continue;
        const aminoAcidObj = expandAndResolve(codon);
        if (aminoAcidObj) map[lowerCodon] = aminoAcidObj;
      }

  return map;
}

const threeLetterSequenceStringToAminoAcidMap = getCodonToAminoAcidMap();

export default threeLetterSequenceStringToAminoAcidMap;
