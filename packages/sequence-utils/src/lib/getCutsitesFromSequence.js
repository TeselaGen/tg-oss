import cutSequenceByRestrictionEnzyme from "./cutSequenceByRestrictionEnzyme";

export default function getCutsitesFromSequence(
  sequence,
  circular,
  restrictionEnzymes
) {
  const cutsitesByName = {};
  for (let i = 0; i < restrictionEnzymes.length; i++) {
    const re = restrictionEnzymes[i];
    const cutsites = cutSequenceByRestrictionEnzyme(sequence, circular, re);
    if (cutsites.length) {
      cutsitesByName[re.name] = cutsites;
    }
  }
  return cutsitesByName;
};
