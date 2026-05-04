import { default as React } from '../../../../node_modules/react';
import { default as PropTypes } from 'prop-types';
export default class ReflexElement extends React.Component<any, any, any> {
    static propTypes: {
        renderOnResizeRate: PropTypes.Requireable<number>;
        propagateDimensions: PropTypes.Requireable<boolean>;
        renderOnResize: PropTypes.Requireable<boolean>;
        resizeHeight: PropTypes.Requireable<boolean>;
        resizeWidth: PropTypes.Requireable<boolean>;
        className: PropTypes.Requireable<string>;
    };
    static defaultProps: {
        renderOnResize: boolean;
        propagateDimensions: boolean;
        renderOnResizeRate: number;
        resizeHeight: boolean;
        resizeWidth: boolean;
        className: string;
    };
    constructor(props: any);
    onResize(rect: any): void;
    setStateThrottled: import('lodash').DebouncedFuncLeading<(state: any) => void>;
    state: {
        dimensions: {
            height: string;
            width: string;
        };
    };
    UNSAFE_componentWillReceiveProps(props: any): Promise<void>;
    toArray(obj: any): any[];
    renderChildren(): any;
    render(): import("react/jsx-runtime").JSX.Element;
}
