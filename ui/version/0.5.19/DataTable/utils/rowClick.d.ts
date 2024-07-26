export default function rowClick(e: any, rowInfo: any, entities: any, props: any): void;
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
