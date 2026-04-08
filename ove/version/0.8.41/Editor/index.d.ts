import { default as React } from '../../../../node_modules/react';
import { default as PropTypes } from 'prop-types';
export class Editor extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    state: {
        rotationRadians: number;
        zoomLevel: number;
        isHotkeyDialogOpen: boolean;
        tabDragging: boolean;
        previewModeFullscreen: boolean;
    };
    getExtraPanel: () => never[];
    getChildContext(): {
        blueprintPortalClassName: string;
    };
    componentDidUpdate(prevProps: any): void;
    hasShownInitialAnnotationToEditDialog: boolean | undefined;
    updateDimensions: import('lodash').DebouncedFunc<() => void>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    onTabDragStart: () => void;
    onTabDragEnd: (result: any) => void;
    getPanelsToShow: () => any[];
    onPreviewModeButtonContextMenu: (event: any) => void;
    closeHotkeyDialog: () => void;
    openHotkeyDialog: () => void;
    togglePreviewFullscreen: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
    inPreviewMode: boolean | undefined;
    hasFullscreenPanel: boolean | undefined;
}
export namespace Editor {
    namespace childContextTypes {
        let blueprintPortalClassName: PropTypes.Requireable<string>;
    }
}
declare const _default: import('../../../../node_modules/react-redux').ConnectedComponent<React.ComponentType<import('../../../../node_modules/react-redux').Matching<any, unknown>>, {
    [x: string]: any;
}>;
export default _default;
