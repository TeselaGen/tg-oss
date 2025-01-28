import { default as React } from '../../../../node_modules/react';
export function getTrimmedRangesToDisplay({ trimmedRange, seqLen }: {
    trimmedRange: any;
    seqLen: any;
}): {
    start: any;
    end: any;
    type: string;
}[];
export default class Minimap extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    shouldComponentUpdate(newProps: any): boolean;
    handleMinimapClick: (e: any) => void;
    getSeqLen: () => any;
    /**
     * @returns current nucleotide char
     * width, nucelotide char width scales with zooming
     */
    getCharWidth: () => number;
    /**
     * @returns the width of the highlighted region of the minimap
     */
    getScrollHandleWidth: () => number;
    getXPositionOfClickInMinimap: (e: any) => number;
    getYPositionOfClickInMinimap: (e: any) => number;
    scrollMinimapVertical: ({ e, force, initialDragYOffsetFromCenter }: {
        e: any;
        force: any;
        initialDragYOffsetFromCenter: any;
    }) => void;
    lastYPosition: number | undefined;
    handleDragStop: () => void;
    isDragging: boolean | undefined;
    /**
     * Handler for beginning to drag across the minimap
     * Sets this.initialDragXOffsetFromCenter and Y for dragging
     * @param {*} e - event
     */
    handleDragStart: (e: any) => void;
    initialDragXOffsetFromCenter: number | undefined;
    initialDragYOffsetFromCenter: number | undefined;
    /**
     * Moves the highlighted region as we drag
     * @param {*} e - event
     */
    handleDrag: (e: any) => void;
    /**
     * @returns this.props.laneheight
     */
    itemSizeGetter: () => any;
    /**
     * Renders a lane (one by one for each call)
     * @param {*} i - lane info
     */
    renderItem: (i: any) => import("react/jsx-runtime").JSX.Element;
    /**
     * @returns minimap compoent
     */
    render(): import("react/jsx-runtime").JSX.Element;
    minimap: HTMLDivElement | null | undefined;
    minimapTracks: HTMLDivElement | undefined;
}
