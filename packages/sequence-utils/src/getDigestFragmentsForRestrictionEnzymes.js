const getDigestFragmentsForCutsites = require("./getDigestFragmentsForCutsites");
const cutSequenceByRestrictionEnzyme = require("./cutSequenceByRestrictionEnzyme");
const { flatMap } = require("lodash");

module.exports = function getDigestFragmentsForRestrictionEnzymes(
  sequence,
  circular,
  restrictionEnzymeOrEnzymes,
  opts
) {
  const restrictionEnzymes = Array.isArray(restrictionEnzymeOrEnzymes)
    ? restrictionEnzymeOrEnzymes
    : [restrictionEnzymeOrEnzymes];
  const cutsites = flatMap(restrictionEnzymes, restrictionEnzyme => {
    return cutSequenceByRestrictionEnzyme(
      sequence,
      circular,
      restrictionEnzyme
    );
  });
  return getDigestFragmentsForCutsites(
    sequence.length,
    circular,
    cutsites,
    opts
  );
};
