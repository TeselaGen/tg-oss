export default function reducerFactory(initialState?: {}): (state: {} | undefined, action: any) => {
    __allEditorsOptions: {};
};
export { default as vectorEditorMiddleware } from './middleware';
export const actions: {
    vectorEditorInitialize: import('redux-act').ComplexActionCreator1<any, any, any>;
    vectorEditorClear: import('redux-act').ComplexActionCreator1<any, any, any>;
    upsertAlignmentRun: import('redux-act').EmptyActionCreator;
    removeAlignmentFromRedux: import('redux-act').EmptyActionCreator;
    updateAlignmentViewVisibility: import('redux-act').EmptyActionCreator;
    alignmentRunUpdate: import('redux-act').EmptyActionCreator;
    default: (state: {} | undefined, { payload, type }: {
        payload?: {} | undefined;
        type: any;
    }) => {};
};
export const editorReducer: import('../../../../node_modules/redux').Reducer<import('../../../../node_modules/redux').CombinedState<{
    instantiated: boolean;
}>, import('../../../../node_modules/redux').AnyAction>;
export function getEditorByName(state: any, editorName: any): any;
