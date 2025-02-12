export namespace viewColumn {
    let width: number;
    let noEllipsis: boolean;
    let hideInMenu: boolean;
    let immovable: boolean;
    let type: string;
    function render(): import("react/jsx-runtime").JSX.Element;
}
export function openColumn({ onDoubleClick, history }: {
    onDoubleClick: any;
    history: any;
}): {
    render: (val: any, record: any, rowInfo: any) => import("react/jsx-runtime").JSX.Element;
    width: number;
    noEllipsis: boolean;
    hideInMenu: boolean;
    immovable: boolean;
    type: string;
};
export namespace multiViewColumn {
    export function columnHeader({ recordIdToIsVisibleMap, setRecordIdToIsVisibleMap }: {
        recordIdToIsVisibleMap: any;
        setRecordIdToIsVisibleMap: any;
    }): import("react/jsx-runtime").JSX.Element;
    export function render_1(val: any, record: any, row: any, { recordIdToIsVisibleMap, setRecordIdToIsVisibleMap }: {
        recordIdToIsVisibleMap: any;
        setRecordIdToIsVisibleMap: any;
    }): import("react/jsx-runtime").JSX.Element | null;
    export { render_1 as render };
}
