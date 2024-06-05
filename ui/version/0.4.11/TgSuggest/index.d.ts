import { default as React } from '../../../../node_modules/react';
export default TgSuggest;
declare class TgSuggest extends React.Component<any, any, any> {
    static defaultProps: {
        onChange: () => void;
        options: never[];
        value: undefined;
    };
    constructor(props: any);
    constructor(props: any, context: any);
    itemRenderer: (i: string | undefined, { index, handleClick, modifiers }: {
        index: any;
        handleClick: any;
        modifiers: any;
    }) => import("react/jsx-runtime").JSX.Element;
    handleItemSelect: (item: any) => any;
    itemListPredicate: (queryString: any, item: any) => any;
    onQueryChange: (query: any) => void;
    renderInputValue: (item: any) => any;
    render(): import("react/jsx-runtime").JSX.Element;
    input: HTMLInputElement | undefined;
}
