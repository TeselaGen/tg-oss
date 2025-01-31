export default function rowClick(e: any, rowInfo: any, entities: any, { reduxFormSelectedEntityIdMap, isSingleSelect, noSelect, onRowClick, isEntityDisabled, withCheckboxes, onDeselect, onSingleRowSelect, onMultiRowSelect, noDeselectAll, onRowSelect, change }: {
    reduxFormSelectedEntityIdMap: any;
    isSingleSelect: any;
    noSelect: any;
    onRowClick: any;
    isEntityDisabled: any;
    withCheckboxes: any;
    onDeselect: any;
    onSingleRowSelect: any;
    onMultiRowSelect: any;
    noDeselectAll: any;
    onRowSelect: any;
    change: any;
}): void;
export function changeSelectedEntities({ idMap, entities, change }: {
    idMap: any;
    entities?: any[] | undefined;
    change: any;
}): void;
export function finalizeSelection({ idMap, entities, props: { onDeselect, onSingleRowSelect, onMultiRowSelect, noDeselectAll, onRowSelect, noSelect, change } }: {
    idMap: any;
    entities: any;
    props: {
        onDeselect: any;
        onSingleRowSelect: any;
        onMultiRowSelect: any;
        noDeselectAll: any;
        onRowSelect: any;
        noSelect: any;
        change: any;
    };
}): void;
