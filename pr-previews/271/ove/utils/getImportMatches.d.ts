export default function getImportMatches({ sourceSequences, destinationSequenceData, isFlexible, matchThreshold, minImportSize }: {
    sourceSequences: any;
    destinationSequenceData: any;
    isFlexible: any;
    matchThreshold: any;
    minImportSize: any;
}): {
    newAnnotations: any[];
    duplicateAnnotations: any[];
};
