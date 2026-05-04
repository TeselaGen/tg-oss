export function handleCaretMoved({ moveBy, circular, sequenceLength, caretPosition, selectionLayer, shiftHeld, type, caretPositionUpdate, selectionLayerUpdate }: {
    moveBy: any;
    circular: any;
    sequenceLength: any;
    caretPosition: any;
    selectionLayer: any;
    shiftHeld: any;
    type: any;
    caretPositionUpdate: any;
    selectionLayerUpdate: any;
}): any;
export function normalizeNewCaretPos(caretPosition: any, sequenceLength: any, circular: any): any;
export function handleSelectionStartGrabbed({ caretPosition, selectionLayer, selectionLayerUpdate, nearestCaretPos, sequenceLength, doNotWrapOrigin, caretPositionUpdate }: {
    caretPosition: any;
    selectionLayer: any;
    selectionLayerUpdate: any;
    nearestCaretPos: any;
    sequenceLength: any;
    doNotWrapOrigin: any;
    caretPositionUpdate: any;
}): void;
export function handleSelectionEndGrabbed({ caretPosition, selectionLayer, selectionLayerUpdate, nearestCaretPos, sequenceLength, doNotWrapOrigin, caretPositionUpdate }: {
    caretPosition: any;
    selectionLayer: any;
    selectionLayerUpdate: any;
    nearestCaretPos: any;
    sequenceLength: any;
    doNotWrapOrigin: any;
    caretPositionUpdate: any;
}): void;
export function handleNoSelectionLayerYet({ caretPosition, selectionLayerUpdate, nearestCaretPos, sequenceLength, doNotWrapOrigin }: {
    caretPosition: any;
    selectionLayerUpdate: any;
    nearestCaretPos: any;
    sequenceLength: any;
    doNotWrapOrigin: any;
}): void;
export function updateSelectionOrCaret({ shiftHeld, sequenceLength, newRangeOrCaret, caretPosition, selectionLayer, selectionLayerUpdate, caretPositionUpdate, doNotWrapOrigin }: {
    shiftHeld: any;
    sequenceLength: any;
    newRangeOrCaret: any;
    caretPosition: any;
    selectionLayer: any;
    selectionLayerUpdate?: ((...args: any[]) => void) | undefined;
    caretPositionUpdate?: ((...args: any[]) => void) | undefined;
    doNotWrapOrigin: any;
}): void;
export function editorDragged({ nearestCaretPos, doNotWrapOrigin, caretPosition, easyStore, caretPositionUpdate, selectionLayerUpdate, selectionLayer, sequenceLength }: {
    nearestCaretPos: any;
    doNotWrapOrigin: any;
    caretPosition?: number | undefined;
    easyStore: any;
    caretPositionUpdate?: ((...args: any[]) => void) | undefined;
    selectionLayerUpdate?: ((...args: any[]) => void) | undefined;
    selectionLayer?: {
        start: number;
        end: number;
    } | undefined;
    sequenceLength: any;
}): void;
export function editorClicked({ nearestCaretPos, shiftHeld, updateSelectionOrCaret }: {
    nearestCaretPos: any;
    shiftHeld: any;
    updateSelectionOrCaret: any;
}): void;
export function editorDragStarted(opts: any): void;
export function editorDragStopped(): void;
