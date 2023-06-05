import {
  autoAnnotate,
  convertApELikeRegexToRegex,
  convertProteinSeqToDNAIupac,
} from './autoAnnotate';

import {
  genbankFeatureTypes,
  getFeatureToColorMap,
  getFeatureTypes,
  getMergedFeatureMap,
} from './featureTypesAndColors';

export * from './computeDigestFragments';
export * from './diffUtils';
export * from './annotationTypes';

/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
//tnr: these are deprecated exports and should no longer be used!
const FeatureTypes = getFeatureTypes();
const featureColors = getFeatureToColorMap();
export {
  getFeatureToColorMap,
  getFeatureTypes,
  genbankFeatureTypes,
  getMergedFeatureMap,
  FeatureTypes,
  featureColors,
};

/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
export { autoAnnotate };
export { convertApELikeRegexToRegex };
export { convertProteinSeqToDNAIupac };
export * as bioData from './bioData';
export { default as getAllInsertionsInSeqReads } from './getAllInsertionsInSeqReads';
export { default as annotateSingleSeq } from './annotateSingleSeq';
export { default as getDegenerateDnaStringFromAAString } from './getDegenerateDnaStringFromAAString';
export { default as getDegenerateRnaStringFromAAString } from './getDegenerateRnaStringFromAAString';
export { default as getVirtualDigest } from './getVirtualDigest';
export { default as isEnzymeType2S } from './isEnzymeType2S';
export { default as insertGapsIntoRefSeq } from './insertGapsIntoRefSeq';
export { default as adjustBpsToReplaceOrInsert } from './adjustBpsToReplaceOrInsert';
export { default as calculatePercentGC } from './calculatePercentGC';
export { default as calculateTm } from './calculateTm';
export { default as cutSequenceByRestrictionEnzyme } from './cutSequenceByRestrictionEnzyme';
export { default as deleteSequenceDataAtRange } from './deleteSequenceDataAtRange';
export { default as DNAComplementMap } from './DNAComplementMap';
export { default as doesEnzymeChopOutsideOfRecognitionSite } from './doesEnzymeChopOutsideOfRecognitionSite';
export { default as aliasedEnzymesByName } from './aliasedEnzymesByName';
export { default as defaultEnzymesByName } from './defaultEnzymesByName';
export { default as generateSequenceData } from './generateSequenceData';
export { default as generateAnnotations } from './generateAnnotations';
export { default as filterAminoAcidSequenceString } from './filterAminoAcidSequenceString';
export { default as filterSequenceString } from './filterSequenceString';
export { default as findNearestRangeOfSequenceOverlapToPosition } from './findNearestRangeOfSequenceOverlapToPosition';
export { default as findOrfsInPlasmid } from './findOrfsInPlasmid';
export { default as findSequenceMatches } from './findSequenceMatches';
export { default as getAminoAcidDataForEachBaseOfDna } from './getAminoAcidDataForEachBaseOfDna';
export { default as getAminoAcidFromSequenceTriplet } from './getAminoAcidFromSequenceTriplet';
export { default as getAminoAcidStringFromSequenceString } from './getAminoAcidStringFromSequenceString';
export { default as getCodonRangeForAASliver } from './getCodonRangeForAASliver';
export { default as getComplementAminoAcidStringFromSequenceString } from './getComplementAminoAcidStringFromSequenceString';
export { default as getComplementSequenceAndAnnotations } from './getComplementSequenceAndAnnotations';
export { default as getComplementSequenceString } from './getComplementSequenceString';
export { default as getCutsitesFromSequence } from './getCutsitesFromSequence';
export { default as getCutsiteType } from './getCutsiteType';
export { default as getInsertBetweenVals } from './getInsertBetweenVals';
export { default as getLeftAndRightOfSequenceInRangeGivenPosition } from './getLeftAndRightOfSequenceInRangeGivenPosition';
export { default as getOrfsFromSequence } from './getOrfsFromSequence';
export { default as getOverlapBetweenTwoSequences } from './getOverlapBetweenTwoSequences';
export { default as getPossiblePartsFromSequenceAndEnzymes } from './getPossiblePartsFromSequenceAndEnzymes';
export { default as getReverseAminoAcidStringFromSequenceString } from './getReverseAminoAcidStringFromSequenceString';
export { default as getReverseComplementAminoAcidStringFromSequenceString } from './getReverseComplementAminoAcidStringFromSequenceString';
export { default as getReverseComplementAnnotation } from './getReverseComplementAnnotation';
export { default as getReverseComplementSequenceAndAnnotations } from './getReverseComplementSequenceAndAnnotations';
export { default as getReverseComplementSequenceString } from './getReverseComplementSequenceString';
export { default as getReverseSequenceString } from './getReverseSequenceString';
export { default as getSequenceDataBetweenRange } from './getSequenceDataBetweenRange';
export { default as guessIfSequenceIsDnaAndNotProtein } from './guessIfSequenceIsDnaAndNotProtein';
export { default as insertSequenceDataAtPosition } from './insertSequenceDataAtPosition';
export { default as insertSequenceDataAtPositionOrRange } from './insertSequenceDataAtPositionOrRange';
export { default as mapAnnotationsToRows } from './mapAnnotationsToRows';
export { default as prepareCircularViewData } from './prepareCircularViewData';
export { default as prepareRowData } from './prepareRowData';
export { default as proteinAlphabet } from './proteinAlphabet';
export { default as rotateSequenceDataToPosition } from './rotateSequenceDataToPosition';
export { default as rotateBpsToPosition } from './rotateBpsToPosition';
export { default as threeLetterSequenceStringToAminoAcidMap } from './threeLetterSequenceStringToAminoAcidMap';
export { default as tidyUpSequenceData } from './tidyUpSequenceData';
export { default as tidyUpAnnotation } from './tidyUpAnnotation';
export { default as condensePairwiseAlignmentDifferences } from './condensePairwiseAlignmentDifferences';
export { default as addGapsToSeqReads } from './addGapsToSeqReads';
export { default as calculateNebTm } from './calculateNebTm';
export { default as calculateNebTa } from './calculateNebTa';
export { default as getDigestFragmentsForCutsites } from './getDigestFragmentsForCutsites';
export { default as getDigestFragmentsForRestrictionEnzymes } from './getDigestFragmentsForRestrictionEnzymes';
export { default as convertDnaCaretPositionOrRangeToAA } from './convertDnaCaretPositionOrRangeToAA';
export { default as convertAACaretPositionOrRangeToDna } from './convertAACaretPositionOrRangeToDna';
export { default as aminoAcidToDegenerateDnaMap } from './aminoAcidToDegenerateDnaMap';
export { default as aminoAcidToDegenerateRnaMap } from './aminoAcidToDegenerateRnaMap';
export { default as degenerateDnaToAminoAcidMap } from './degenerateDnaToAminoAcidMap';
export { default as degenerateRnaToAminoAcidMap } from './degenerateRnaToAminoAcidMap';
export { default as getMassOfAaString } from './getMassOfAaString';
export { default as shiftAnnotationsByLen } from './shiftAnnotationsByLen';
export { default as adjustAnnotationsToInsert } from './adjustAnnotationsToInsert';
