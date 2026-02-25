import { default as React } from '../../../../node_modules/react';
import { default as PropTypes } from 'prop-types';
export default class ReflexSplitter extends React.Component<any, any, any> {
    static propTypes: {
        children: PropTypes.Requireable<NonNullable<PropTypes.ReactNodeLike>>;
        onStartResize: PropTypes.Requireable<(...args: any[]) => any>;
        onStopResize: PropTypes.Requireable<(...args: any[]) => any>;
        className: PropTypes.Requireable<string>;
        propagate: PropTypes.Requireable<boolean>;
        onResize: PropTypes.Requireable<(...args: any[]) => any>;
        style: PropTypes.Requireable<object>;
    };
    static defaultProps: {
        document: Document | null;
        onStartResize: null;
        onStopResize: null;
        propagate: boolean;
        onResize: null;
        className: string;
        style: {};
    };
    constructor(props: any);
    state: {
        active: boolean;
    };
    onMouseMove(event: any): void;
    onMouseDown(event: any): void;
    onMouseUp(event: any): void;
    document: any;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
