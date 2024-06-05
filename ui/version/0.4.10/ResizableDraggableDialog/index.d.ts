import { default as React } from '../../../../node_modules/react';
export default class ResizableDraggableDialog extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    componentDidMount(): void;
    resizeObs: ResizeObserver | undefined;
    state: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    setDefaults: ({ doNotSetXOrWidth }?: {
        doNotSetXOrWidth: any;
    }) => void;
    onWindowResize: () => void;
    componentWillUnmount(): void;
    getWindowWidthAndHeight: () => {
        windowWidth: number;
        windowHeight: number;
    };
    render(): import("react/jsx-runtime").JSX.Element;
    containerEl: HTMLDivElement | undefined;
}
