import { default as React } from '../../../../node_modules/react';
export default Clipboard;
declare class Clipboard extends React.Component<any, any, any> {
    static defaultProps: {
        className: string;
    };
    constructor(props: any);
    constructor(props: any, context: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    handleKeyDown: (e: any) => void;
    origFocusedElement: Element | null | undefined;
    handleKeyUp: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
    node: HTMLInputElement | undefined;
}
