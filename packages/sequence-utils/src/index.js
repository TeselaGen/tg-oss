const diffUtils = require("./diffUtils");
const {
  autoAnnotate,
  convertApELikeRegexToRegex,
  convertProteinSeqToDNAIupac
} = require("./autoAnnotate");
const {
  genbankFeatureTypes,
  getFeatureToColorMap,
  getFeatureTypes,
  getMergedFeatureMap
} = require("./featureTypesAndColors");
module.exports.getFeatureToColorMap = getFeatureToColorMap;
module.exports.getFeatureTypes = getFeatureTypes;
module.exports.genbankFeatureTypes = genbankFeatureTypes;
module.exports.getMergedFeatureMap = getMergedFeatureMap;
/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
//tnr: these are deprecated exports and should no longer be used!
module.exports.FeatureTypes = getFeatureTypes();
module.exports.featureColors = getFeatureToColorMap();
/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */
module.exports.autoAnnotate = autoAnnotate;
module.exports.convertApELikeRegexToRegex = convertApELikeRegexToRegex;
module.exports.convertProteinSeqToDNAIupac = convertProteinSeqToDNAIupac;
module.exports.diffUtils = diffUtils;
module.exports.getDiffFromSeqs = diffUtils.getDiffFromSeqs;
module.exports.patchSeqWithDiff = diffUtils.patchSeqWithDiff;
module.exports.reverseSeqDiff = diffUtils.reverseSeqDiff;
module.exports.getAllInsertionsInSeqReads = require("./getAllInsertionsInSeqReads");
module.exports.annotateSingleSeq = require("./annotateSingleSeq");
module.exports.getDegenerateDnaStringFromAAString = require("./getDegenerateDnaStringFromAAString");
module.exports.getDegenerateRnaStringFromAAString = require("./getDegenerateRnaStringFromAAString");
module.exports.getVirtualDigest = require("./getVirtualDigest");
module.exports.isEnzymeType2S = require("./isEnzymeType2S");
module.exports.insertGapsIntoRefSeq = require("./insertGapsIntoRefSeq");
module.exports.adjustBpsToReplaceOrInsert = require("./adjustBpsToReplaceOrInsert");
module.exports.annotationTypes = require("./annotationTypes");
module.exports.calculatePercentGC = require("./calculatePercentGC");
module.exports.calculateTm = require("./calculateTm");
module.exports.bioData = require("./bioData");
module.exports.cutSequenceByRestrictionEnzyme = require("./cutSequenceByRestrictionEnzyme");
module.exports.deleteSequenceDataAtRange = require("./deleteSequenceDataAtRange");
module.exports.DNAComplementMap = require("./DNAComplementMap");
module.exports.doesEnzymeChopOutsideOfRecognitionSite = require("./doesEnzymeChopOutsideOfRecognitionSite");
module.exports.aliasedEnzymesByName = require("./aliasedEnzymesByName");
module.exports.defaultEnzymesByName = require("./defaultEnzymesByName");
module.exports.generateSequenceData = require("./generateSequenceData");
module.exports.generateAnnotations = require("./generateAnnotations");
module.exports.filterAminoAcidSequenceString = require("./filterAminoAcidSequenceString");
module.exports.filterSequenceString = require("./filterSequenceString");
module.exports.findNearestRangeOfSequenceOverlapToPosition = require("./findNearestRangeOfSequenceOverlapToPosition");
module.exports.findOrfsInPlasmid = require("./findOrfsInPlasmid");
module.exports.findSequenceMatches = require("./findSequenceMatches");
module.exports.getAminoAcidDataForEachBaseOfDna = require("./getAminoAcidDataForEachBaseOfDna");
module.exports.getAminoAcidFromSequenceTriplet = require("./getAminoAcidFromSequenceTriplet");
module.exports.getAminoAcidStringFromSequenceString = require("./getAminoAcidStringFromSequenceString");
module.exports.getCodonRangeForAASliver = require("./getCodonRangeForAASliver");
module.exports.getComplementAminoAcidStringFromSequenceString = require("./getComplementAminoAcidStringFromSequenceString");
module.exports.getComplementSequenceAndAnnotations = require("./getComplementSequenceAndAnnotations");
module.exports.getComplementSequenceString = require("./getComplementSequenceString");
module.exports.getCutsitesFromSequence = require("./getCutsitesFromSequence");
module.exports.getCutsiteType = require("./getCutsiteType");
module.exports.computeDigestFragments = require("./computeDigestFragments").computeDigestFragments;
module.exports.getDigestFragsForSeqAndEnzymes = require("./computeDigestFragments").getDigestFragsForSeqAndEnzymes;
module.exports.getInsertBetweenVals = require("./getInsertBetweenVals");
module.exports.getLeftAndRightOfSequenceInRangeGivenPosition = require("./getLeftAndRightOfSequenceInRangeGivenPosition");
module.exports.getOrfsFromSequence = require("./getOrfsFromSequence");
module.exports.getOverlapBetweenTwoSequences = require("./getOverlapBetweenTwoSequences");
module.exports.getPossiblePartsFromSequenceAndEnzymes = require("./getPossiblePartsFromSequenceAndEnzymes");
module.exports.getReverseAminoAcidStringFromSequenceString = require("./getReverseAminoAcidStringFromSequenceString");
module.exports.getReverseComplementAminoAcidStringFromSequenceString = require("./getReverseComplementAminoAcidStringFromSequenceString");
module.exports.getReverseComplementAnnotation = require("./getReverseComplementAnnotation");
module.exports.getReverseComplementSequenceAndAnnotations = require("./getReverseComplementSequenceAndAnnotations");
module.exports.getReverseComplementSequenceString = require("./getReverseComplementSequenceString");
module.exports.getReverseSequenceString = require("./getReverseSequenceString");
module.exports.getSequenceDataBetweenRange = require("./getSequenceDataBetweenRange");
module.exports.guessIfSequenceIsDnaAndNotProtein = require("./guessIfSequenceIsDnaAndNotProtein");
module.exports.insertSequenceDataAtPosition = require("./insertSequenceDataAtPosition");
module.exports.insertSequenceDataAtPositionOrRange = require("./insertSequenceDataAtPositionOrRange");
module.exports.mapAnnotationsToRows = require("./mapAnnotationsToRows");
module.exports.prepareCircularViewData = require("./prepareCircularViewData");
module.exports.prepareRowData = require("./prepareRowData");
module.exports.proteinAlphabet = require("./proteinAlphabet");
module.exports.rotateSequenceDataToPosition = require("./rotateSequenceDataToPosition");
module.exports.rotateBpsToPosition = require("./rotateBpsToPosition");
module.exports.threeLetterSequenceStringToAminoAcidMap = require("./threeLetterSequenceStringToAminoAcidMap");
module.exports.tidyUpSequenceData = require("./tidyUpSequenceData");
module.exports.tidyUpAnnotation = require("./tidyUpAnnotation");
module.exports.condensePairwiseAlignmentDifferences = require("./condensePairwiseAlignmentDifferences");
module.exports.addGapsToSeqReads = require("./addGapsToSeqReads");
module.exports.calculateNebTm = require("./calculateNebTm");
module.exports.calculateNebTa = require("./calculateNebTa");
module.exports.getDigestFragmentsForCutsites = require("./getDigestFragmentsForCutsites");
module.exports.getDigestFragmentsForRestrictionEnzymes = require("./getDigestFragmentsForRestrictionEnzymes");
module.exports.convertDnaCaretPositionOrRangeToAA = require("./convertDnaCaretPositionOrRangeToAA");
module.exports.convertAACaretPositionOrRangeToDna = require("./convertAACaretPositionOrRangeToDna");
module.exports.aminoAcidToDegenerateDnaMap = require("./aminoAcidToDegenerateDnaMap");
module.exports.aminoAcidToDegenerateRnaMap = require("./aminoAcidToDegenerateRnaMap");
module.exports.degenerateDnaToAminoAcidMap = require("./degenerateDnaToAminoAcidMap");
module.exports.degenerateRnaToAminoAcidMap = require("./degenerateRnaToAminoAcidMap");
module.exports.getMassOfAaString = require("./getMassOfAaString");
module.exports.shiftAnnotationsByLen = require("./shiftAnnotationsByLen");
module.exports.adjustAnnotationsToInsert = require("./adjustAnnotationsToInsert");
