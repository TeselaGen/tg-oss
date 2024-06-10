import { default as React } from '../../../../node_modules/react';
import { default as Clipboard } from 'clipboard';
export class AlignmentView extends React.Component<any, any, any> {
    constructor(props: any);
    bindOutsideChangeHelper: {};
    onShortcutCopy: void;
    getMaxLength: () => any;
    getNearestCursorPositionToMouseEvent(rowData: any, event: any, callback: any): void;
    charWidth: number | undefined;
    componentWillUnmount(): void;
    handleAlignmentCopy: (event: any) => void;
    getAllAlignmentsFastaText: () => string;
    state: {
        alignmentName: any;
        isTrackDragging: boolean;
        charWidthInLinearView: number;
        scrollAlignmentView: boolean;
        width: number;
        nameDivWidth: number;
    };
    easyStore: {
        selectionLayer: {
            start: number;
            end: number;
        };
        caretPosition: number;
        percentScrolled: number;
        viewportWidth: number;
        verticalVisibleRange: {
            start: number;
            end: number;
        };
    };
    getMinCharWidth: (noNameDiv: any) => number;
    getSequenceLength: () => any;
    componentDidUpdate(prevProps: any): Promise<void>;
    componentDidMount(): void;
    annotationClicked: ({ event, annotation, gapsBefore, gapsInside }: {
        event: any;
        annotation: any;
        gapsBefore?: number | undefined;
        gapsInside?: number | undefined;
    }) => void;
    updateSelectionOrCaret: (shiftHeld: any, newRangeOrCaret: any, { forceReduxUpdate }?: {
        forceReduxUpdate: any;
    }) => void;
    caretPositionUpdate: (position: any) => void;
    debouncedAlignmentRunUpdate: import('lodash').DebouncedFunc<any>;
    forceReduxSelectionLayerUpdate: (newSelection: any) => void;
    selectionLayerUpdate: (newSelection: any, { forceReduxUpdate }?: {
        forceReduxUpdate: any;
    }) => void;
    getCharWidthInLinearView: () => number;
    getNumBpsShownInLinearView: () => number;
    setVerticalScrollRange: import('lodash').DebouncedFuncLeading<() => void>;
    handleScroll: () => void;
    oldAlignmentHolderScrollTop: any;
    handleTopScroll: () => void;
    /**
     * Responsible for handling resizing the highlighted region of the minimap
     * @param {*} newSliderSize
     * @param {*} newPercent
     */
    onMinimapSizeAdjust: (newSliderSize: any, newPercent: any) => void;
    blockScroll: boolean | undefined;
    setCharWidthInLinearView: ({ charWidthInLinearView }: {
        charWidthInLinearView: any;
    }) => void;
    scrollToCaret: () => void;
    scrollAlignmentToPercent: (scrollPercentage: any) => void;
    scrollYToTrack: (trackIndex: any) => void;
    estimateRowHeight: (index: any, cache: any) => any;
    rowData: {
        rowNumber: number;
        start: number;
        end: number;
        sequence: any;
    }[] | undefined;
    getMaxLinearViewWidth: () => number;
    renderItem: (_i: any, key: any, isTemplate: any, cloneProps: any) => import("react/jsx-runtime").JSX.Element | null;
    handleResize: import('lodash').DebouncedFuncLeading<([e]: any) => void>;
    removeMinimapHighlightForMouseLeave: () => void;
    updateMinimapHighlightForMouseMove: (event: any) => void;
    latestMouseY: any;
    updateMinimapHighlight: () => void;
    onTrackDragStart: () => void;
    onTrackDragEnd: ({ destination, source }: {
        destination: any;
        source: any;
    }) => void;
    render(): import("react/jsx-runtime").JSX.Element | "corrupted data!";
    veTracksAndAlignmentHolder: HTMLDivElement | null | undefined;
    copyAllAlignmentsFastaClipboardHelper: Clipboard | undefined;
    copySpecificAlignmentFastaClipboardHelper: Clipboard | undefined;
    copySpecificAlignmentAsPlainClipboardHelper: Clipboard | undefined;
    InfiniteScroller: any;
    isZooming: boolean | undefined;
    getTrackTrimmingOptions({ e, allTracks, upsertAlignmentRun, currentPairwiseAlignmentIndex, alignmentId }: {
        e: any;
        allTracks: any;
        upsertAlignmentRun: any;
        currentPairwiseAlignmentIndex: any;
        alignmentId: any;
    }): void;
}
declare const _default: any;
export default _default;
