export default Cutsites;
declare function Cutsites({ radius, noRedux, editorName, showCutsiteLabels, cutsiteClicked, cutsiteDoubleClicked, cutsiteRightClicked, cutsites, cutsiteWidth, annotationHeight, sequenceLength }: {
    radius: any;
    noRedux: any;
    editorName: any;
    showCutsiteLabels: any;
    cutsiteClicked: any;
    cutsiteDoubleClicked: any;
    cutsiteRightClicked: any;
    cutsites: any;
    cutsiteWidth?: number | undefined;
    annotationHeight?: number | undefined;
    sequenceLength: any;
}): {
    height: number;
    labels: {};
    component: import("react/jsx-runtime").JSX.Element;
} | null;
