export const filteredRestrictionEnzymesUpdate: import('redux-act').ComplexActionCreator1<any, any, any>;
export const isEnzymeFilterAndUpdate: import('redux-act').ComplexActionCreator1<any, any, any>;
export const filteredRestrictionEnzymesReset: import('redux-act').ComplexActionCreator1<any, any, any>;
export const filteredRestrictionEnzymesAdd: import('redux-act').ComplexActionCreator1<any, any, any>;
declare const _default: import('../../../../node_modules/redux').Reducer<import('../../../../node_modules/redux').CombinedState<{
    isEnzymeFilterAnd: boolean;
    filteredRestrictionEnzymes: {
        value: string;
        label: string;
        cutsThisManyTimes: number;
    }[];
}>, import('../../../../node_modules/redux').AnyAction>;
export default _default;
