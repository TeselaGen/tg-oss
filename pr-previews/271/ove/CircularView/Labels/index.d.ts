export function getTextLengthWithCollapseSpace(text: any, collapseWhiteSpace?: boolean): any;
export default Labels;
declare function Labels({ labels, extraSideSpace, smartCircViewLabelRender, radius: outerRadius, editorName, noRedux, rotationRadians, textScalingFactor, labelLineIntensity, labelSize, fontHeightMultiplier, circularViewWidthVsHeightRatio, condenseOverflowingXLabels }: {
    labels?: never[] | undefined;
    extraSideSpace: any;
    smartCircViewLabelRender: any;
    radius: any;
    editorName: any;
    noRedux: any;
    rotationRadians: any;
    textScalingFactor: any;
    labelLineIntensity: any;
    labelSize?: number | undefined;
    fontHeightMultiplier?: number | undefined;
    circularViewWidthVsHeightRatio: any;
    condenseOverflowingXLabels?: boolean | undefined;
}): {
    component: null;
    height: number;
} | {
    component: import("react/jsx-runtime").JSX.Element;
    height: number;
};
