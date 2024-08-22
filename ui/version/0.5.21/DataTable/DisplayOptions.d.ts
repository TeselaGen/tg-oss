import { default as React } from '../../../../node_modules/react';
export default class DisplayOptions extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    state: {
        isOpen: boolean;
        searchTerms: {};
    };
    openPopover: () => void;
    closePopover: () => void;
    changeTableDensity: (e: any) => void;
    toggleForcedHidden: (e: any) => any;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
