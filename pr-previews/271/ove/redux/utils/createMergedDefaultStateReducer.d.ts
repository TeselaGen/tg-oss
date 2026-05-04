export default function createMergedDefaultStateReducer(handlers: any, defaultState: any): {
    (newState: {} | undefined, action: any): any;
    __shouldUseMergedState: boolean;
};
