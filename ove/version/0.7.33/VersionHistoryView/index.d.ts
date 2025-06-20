import { default as React } from '../../../../node_modules/react';
export class VersionHistoryView extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    state: {
        selectedVersion: undefined;
        versionList: {
            dateChanged: string;
            id: string;
        }[];
    };
    updateSeqData: (sequenceData: any) => void;
    activeSeqData: any;
    componentDidMount: () => Promise<void>;
    getCurrentSeqData: () => Promise<any>;
    onRowSelect: ([row]: [any]) => Promise<void>;
    _getVersionList: () => Promise<void>;
    revertToSelectedVersion: () => void;
    goBack: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare const _default: any;
export default _default;
