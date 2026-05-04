export function mapDispatchToActions(dispatch: any, ownProps: any): {
    selectionLayerUpdate: any;
    caretPositionUpdate: any;
    dispatch: any;
};
export function fakeActionOverrides(): {};
export function getCombinedActions(editorName: any, actions: any, actionOverrides: any, dispatch: any, ownProps: any): {};
export function getShowGCContent(state: any, ownProps: any): any;
export function handleSave(props: any): (opts?: {}) => Promise<any>;
export function handleInverse(props: any): () => false | undefined;
export function updateCircular(props: any): (isCircular: any) => Promise<void>;
export function importSequenceFromFile(props: any): (file: any, opts?: {}) => Promise<void>;
export function exportSequenceToFile(props: any): (format: any, options: any) => void;
declare const _default: any;
export default _default;
export function connectToEditor(fn: any): import('../../../../node_modules/react-redux').InferableComponentEnhancerWithProps<any, any>;
export const withEditorPropsNoRedux: any;
