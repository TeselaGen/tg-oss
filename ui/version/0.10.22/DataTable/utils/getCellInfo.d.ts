export function getCellInfo({ columnIndex, columnPath, rowId, schema, entities, rowIndex, isEntityDisabled, entity }: {
    columnIndex: any;
    columnPath: any;
    rowId: any;
    schema: any;
    entities: any;
    rowIndex: any;
    isEntityDisabled: any;
    entity: any;
}): {
    cellId: string;
    cellIdAbove: any;
    cellIdToRight: any;
    cellIdBelow: any;
    cellIdToLeft: any;
    rowDisabled: any;
};
