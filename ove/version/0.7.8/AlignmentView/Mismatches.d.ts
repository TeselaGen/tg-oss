import { default as React } from '../../../../node_modules/react';
declare const _default: import('../../../../node_modules/react-redux').ConnectedComponent<typeof Mismatches, {
    context?: React.Context<import('../../../../node_modules/react-redux').ReactReduxContextValue<any, import('../../../../node_modules/redux').AnyAction>> | undefined;
    store?: import('../../../../node_modules/redux').Store<any, import('../../../../node_modules/redux').AnyAction> | undefined;
} | {
    store?: import('../../../../node_modules/redux').Store<any, import('../../../../node_modules/redux').AnyAction> | undefined;
}>;
export default _default;
declare class Mismatches extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    UNSAFE_componentWillMount(): void;
    getGapMap: (sequence: any) => number[];
    getMismatchList: (alignmentData: any, mismatches: any) => {
        mismatches: number;
        start: number;
        end: number;
    }[];
    render(): import("react/jsx-runtime").JSX.Element;
}
