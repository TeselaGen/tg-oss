export default function createVectorEditor(_node: any, { editorName, ...rest }?: {
    editorName?: string | undefined;
}): {
    renderResponse: void;
    close(): void;
    updateEditor(values: any): void;
    addAlignment(values: any): void;
    getState(): any;
};
export function createVersionHistoryView(node: any, { editorName, ...rest }?: {
    editorName?: string | undefined;
}): {
    renderResponse: void;
    updateEditor(values: any): void;
    getState(): any;
};
export function createAlignmentView(node: any, props?: {}): {
    renderResponse: void;
    updateAlignment(values: any): void;
    getState(): any;
};
