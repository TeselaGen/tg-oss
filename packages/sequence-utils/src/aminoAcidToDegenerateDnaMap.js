const aminoAcidToDegenerateDnaMap = {
  "-": "---",
  ".": "...",
  "*": "trr",
  a: "gcn",
  b: "ray", // D or N => aay + gay = ray
  c: "tgy",
  d: "gay",
  e: "gar",
  f: "tty",
  g: "ggn",
  h: "cay",
  i: "ath",
  j: "htn", // L or I ytn + ath => htn
  k: "aar",
  l: "ytn", // YTR、CTN => Y=CT, N=AGCT
  m: "atg",
  n: "aay",
  o: "tag", // Pyrrolysine, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2933860/
  p: "ccn",
  q: "car",
  r: "mgn", // CGN、MGR => M=AC, N=AGCT
  s: "wsn", // TCN、AGY => AT = w, CG = S, N is AGCT
  t: "acn",
  u: "tga", // Selenocysteine, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2933860/
  v: "gtn",
  w: "tgg",
  x: "nnn", // unknown aa.
  y: "tay",
  z: "sar" // E or Q, => gar + car = sar
};
module.exports = aminoAcidToDegenerateDnaMap;
