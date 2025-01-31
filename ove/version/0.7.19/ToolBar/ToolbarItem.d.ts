import { default as React } from '../../../../node_modules/react';
declare const _default: import('../../../../node_modules/react-redux').ConnectedComponent<typeof ToolbarItem, {
    [x: string]: any;
}>;
export default _default;
declare class ToolbarItem extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    toggleDropdown: ({ forceClose }?: {
        forceClose: any;
    }) => void;
    render(): import("react/jsx-runtime").JSX.Element | null;
    dropdownNode: HTMLDivElement | undefined;
}
