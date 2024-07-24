export function getSelectionMessage({ caretPosition, selectionLayer, customTitle, sequenceLength, sequenceData, showGCContent, GCDecimalDigits, isProtein }: {
    caretPosition?: number | undefined;
    selectionLayer?: {
        start: number;
        end: number;
    } | undefined;
    customTitle: any;
    sequenceLength: any;
    sequenceData: any;
    showGCContent: any;
    GCDecimalDigits: any;
    isProtein: any;
}): string;
export function preventDefaultStopPropagation(e: any): void;
export function getNodeToRefocus(caretEl: any): any;
export function getEmptyText({ sequenceData, caretPosition }: {
    sequenceData: any;
    caretPosition: any;
}): import("react/jsx-runtime").JSX.Element | null;
export function tryToRefocusEditor(): void;
export function getCustomEnzymes(): any;
export function addCustomEnzyme(newEnz: any): void;
export function pareDownAnnotations(annotations: any, max: any): any[];
export function getParedDownWarning({ nameUpper, maxToShow, isAdjustable }: {
    nameUpper: any;
    maxToShow: any;
    isAdjustable: any;
}): import("react/jsx-runtime").JSX.Element;
export function getClientX(event: any): any;
export function getClientY(event: any): any;
export function hideAnnByLengthFilter(hideOpts: any, ann: any, seqLen: any): any;
export function getSelFromWrappedAddon(selectionLayer: any, sequenceLength: any): any;
export function getStripedPattern({ color, id }: {
    color: any;
    id: any;
}): import("react/jsx-runtime").JSX.Element;
export function getEnzymeAliases(enzyme: any): any[];
