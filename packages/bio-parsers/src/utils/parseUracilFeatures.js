export default function parseUracilFeatures(sequenceBps, featureList = []) {
  const cleanedBps = sequenceBps.replace(/u/gi, (u, index) => {
    featureList.push({
      type: "misc_feature",
      name: "tg_uracil",
      strand: 1,
      start: index,
      end: index,
    });
    return u === "U" ? "T" : "t";
  });
  return cleanedBps
}
