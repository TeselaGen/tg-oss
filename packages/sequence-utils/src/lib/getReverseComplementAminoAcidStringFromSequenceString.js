
import getAminoAcidStringFromSequenceString from './getAminoAcidStringFromSequenceString';
import getReverseComplementSequenceString from './getReverseComplementSequenceString';

export default function getReverseComplementAminoAcidStringFromSequenceString(sequenceString) {
  return getAminoAcidStringFromSequenceString(getReverseComplementSequenceString(sequenceString))
};
