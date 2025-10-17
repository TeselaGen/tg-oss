import { default as React } from '../../../../node_modules/react';
export function StatusBar({ disableSetReadOnly, disableBpEditing, onSave, editorName, showCircularity, showMoleculeType, showReadOnly, showAvailability, showGCContentByDefault, onSelectionOrCaretChanged, GCDecimalDigits, isProtein, showAminoAcidUnitAsCodon, beforeReadOnlyChange }: {
    disableSetReadOnly: any;
    disableBpEditing: any;
    onSave: any;
    editorName: any;
    showCircularity?: boolean | undefined;
    showMoleculeType?: boolean | undefined;
    showReadOnly?: boolean | undefined;
    showAvailability?: boolean | undefined;
    showGCContentByDefault: any;
    onSelectionOrCaretChanged: any;
    GCDecimalDigits?: number | undefined;
    isProtein: any;
    showAminoAcidUnitAsCodon: any;
    beforeReadOnlyChange: any;
}): import("react/jsx-runtime").JSX.Element;
export const EditReadOnlyItem: import('../../../../node_modules/react-redux').ConnectedComponent<React.ComponentType<import('../../../../node_modules/react-redux').Matching<any, unknown>>, {
    [x: string]: any;
}>;
export const EditCircularityItem: any;
export const EditAvailabilityItem: import('../../../../node_modules/react-redux').ConnectedComponent<React.ComponentType<import('../../../../node_modules/react-redux').Matching<any, unknown>>, {
    [x: string]: any;
}>;
export default StatusBar;
