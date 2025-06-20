export default Axis;
declare function Axis({ radius, showAxisNumbers, tickMarkHeight, textOffset, ringThickness, zoomLevel }: {
    radius: any;
    showAxisNumbers: any;
    tickMarkHeight?: number | undefined;
    textOffset?: number | undefined;
    ringThickness?: number | undefined;
    zoomLevel: any;
}): {
    component: import("react/jsx-runtime").JSX.Element;
    height: number;
};
