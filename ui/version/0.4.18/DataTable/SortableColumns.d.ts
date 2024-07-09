import { default as React } from '../../../../node_modules/react';
export default SortableColumns;
declare class SortableColumns extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    shouldCancelStart: (e: any) => boolean;
    onSortEnd: (...args: any[]) => void;
    onSortStart: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
