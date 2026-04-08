import { default as React } from '../../../../node_modules/react';
export default class UncontrolledSliderWithPlusMinusBtns extends React.Component<any, any, any> {
    static getDerivedStateFromProps(nextProps: any, prevState: any): {
        value: any;
        oldInitialValue: any;
    } | null;
    constructor(props: any);
    constructor(props: any, context: any);
    state: {
        value: number;
    };
    render(): import("react/jsx-runtime").JSX.Element;
}
