import { default as React } from '../../../../node_modules/react';
import { default as ReflexEvents } from './ReflexEvents';
import { default as PropTypes } from 'prop-types';
export default ReflexContainer;
declare class ReflexContainer extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        flexData: never[];
    };
    events: ReflexEvents;
    onSplitterStartResize(data: any): void;
    onSplitterStopResize(): void;
    onSplitterResize(data: any): void;
    onElementSize(data: any): Promise<any>;
    children: any[];
    setPartialState(partialState: any): Promise<any>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    getValidChildren(props?: Readonly<any>): any[];
    UNSAFE_componentWillReceiveProps(props: any): void;
    flexHasChanged(props: any): boolean;
    getSize(element: any): any;
    getOffset(event: any): number;
    previousPos: any;
    elements: any[] | null | undefined;
    hasCollapsed: any;
    closeThreshold: number | undefined;
    stateBeforeCollapse: {
        flexData: never[];
    } | undefined;
    isNegativeWhenCollapsing: boolean | undefined;
    isSplitterElement(element: any): boolean;
    adjustFlex(elements: any): void;
    computeAvailableOffset(idx: any, offset: any): number;
    checkPropagate(idx: any, direction: any): any;
    computeAvailableStretch(idx: any, offset: any): any;
    computeAvailableShrink(idx: any, offset: any): any;
    computePixelFlex(): number;
    addOffset(element: any, offset: any): void;
    dispatchStretch(idx: any, offset: any): any;
    dispatchShrink(idx: any, offset: any): any;
    dispatchOffset(idx: any, offset: any): any[];
    emitElementsEvent(elements: any, event: any): void;
    computeFlexData(children?: any[]): any;
    guid(format?: string): string;
    toArray(obj: any): any[];
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace ReflexContainer {
    namespace propTypes {
        let orientation: PropTypes.Requireable<string>;
        let className: PropTypes.Requireable<string>;
        let style: PropTypes.Requireable<object>;
    }
    namespace defaultProps {
        let orientation_1: string;
        export { orientation_1 as orientation };
        let className_1: string;
        export { className_1 as className };
        let style_1: {};
        export { style_1 as style };
    }
}
