export function getPairwiseOverviewLinearViewOptions({ isTemplate }: {
    isTemplate: any;
}): {
    annotationVisibilityOverrides: {
        features: boolean;
        translations: boolean;
        parts: boolean;
        orfs: boolean;
        orfTranslations: boolean;
        cdsFeatureTranslations: boolean;
        axis: boolean;
        cutsites: boolean;
        primers: boolean;
        chromatogram: boolean;
        sequence: boolean;
        dnaColors: boolean;
        reverseSequence: boolean;
        axisNumbers: boolean;
    };
} | {
    annotationVisibilityOverrides?: undefined;
};
