import { default as React } from '../../../../node_modules/react';
export default MenuBar;
declare class MenuBar extends React.Component<any, any, any> {
    static defaultProps: {
        className: string;
        style: {};
    };
    constructor(props: any);
    hotkeyEnabler: ({ children }?: {}) => import("react/jsx-runtime").JSX.Element;
    state: {
        isOpen: boolean;
        openIndex: null;
        helpItemQueryStringTracker: string;
    };
    handleInteraction: (index: any) => (newOpenState: any) => void;
    handleMouseOver: (index: any) => () => void;
    getAllMenuItems: () => any;
    addHelpItemIfNecessary: (menu: any, i: any) => any;
    isTopLevelSearch: boolean | undefined;
    menuSearchIndex: any;
    searchInput: HTMLInputElement | undefined;
    helpItemRenderer: (i: any, b: any) => import("react/jsx-runtime").JSX.Element;
    handleItemClickOrSelect: (__i: any) => (_i: any) => void;
    toggleFocusSearchMenu: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
    n: HTMLButtonElement | undefined;
}
