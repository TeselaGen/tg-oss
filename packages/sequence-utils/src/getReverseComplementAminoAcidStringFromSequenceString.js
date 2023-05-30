
const getAminoAcidStringFromSequenceString = require('./getAminoAcidStringFromSequenceString');
const getReverseComplementSequenceString = require('./getReverseComplementSequenceString');

module.exports = function getReverseComplementAminoAcidStringFromSequenceString(sequenceString) {
  return getAminoAcidStringFromSequenceString(getReverseComplementSequenceString(sequenceString))
};
