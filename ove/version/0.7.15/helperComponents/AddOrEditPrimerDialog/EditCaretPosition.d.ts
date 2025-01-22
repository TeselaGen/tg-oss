/**
 * @function
 * @description
 * @param  {DOMElement} container The container in which the cursor position must be saved
 * @return {Function}             A function used to restore caret position
 */
export function selectionSaveCaretPosition(container: DOMElement): Function;
export default EditCaretPositioning;
declare namespace EditCaretPositioning {
    function saveSelection(containerEl: any): {
        start: number;
        end: number;
    };
    function restoreSelection(containerEl: any, savedSel: any): void;
}
