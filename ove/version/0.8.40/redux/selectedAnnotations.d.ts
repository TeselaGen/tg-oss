export function replacementLayerRightClicked({ event, annotation }: {
    event: any;
    annotation: any;
}, meta: any): (dispatch: any) => void;
export const annotationSelect: import('redux-act').ComplexActionCreator1<any, any, any>;
export const updateSelectedAnnotation: import('redux-act').ComplexActionCreator1<any, any, any>;
export const annotationDeselect: import('redux-act').ComplexActionCreator1<any, any, any>;
export const annotationDeselectAll: import('redux-act').ComplexActionCreator1<any, any, any>;
declare const _default: import('redux-act').Reducer<{
    idMap: {};
    idStack: never[];
}, import('../../../../node_modules/redux').AnyAction>;
export default _default;
