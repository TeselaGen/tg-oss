import { getIdOrCodeOrIndex } from "./getIdOrCodeOrIndex";
import { Entity } from "./types/Entity";

export const getCellInfo = <T extends Entity>({
  columnIndex,
  columnPath,
  rowId,
  schema,
  entities,
  rowIndex,
  isEntityDisabled,
  entity
}: {
  columnIndex: number;
  columnPath: string;
  rowId: string | number;
  schema: { fields: { path: string }[] };
  entities: T[];
  rowIndex: number;
  isEntityDisabled: (entity: T) => boolean;
  entity: T;
}) => {
  const leftpath = schema.fields[columnIndex - 1]?.path;
  const rightpath = schema.fields[columnIndex + 1]?.path;
  const cellIdToLeft = leftpath && `${rowId}:${leftpath}`;
  const cellIdToRight = rightpath && `${rowId}:${rightpath}`;
  const rowAboveId =
    entities[rowIndex - 1] &&
    getIdOrCodeOrIndex(entities[rowIndex - 1], rowIndex - 1);
  const rowBelowId =
    entities[rowIndex + 1] &&
    getIdOrCodeOrIndex(entities[rowIndex + 1], rowIndex + 1);
  const cellIdAbove = rowAboveId && `${rowAboveId}:${columnPath}`;
  const cellIdBelow = rowBelowId && `${rowBelowId}:${columnPath}`;

  const cellId = `${rowId}:${columnPath}`;
  const rowDisabled = isEntityDisabled(entity);
  return {
    cellId,
    cellIdAbove,
    cellIdToRight,
    cellIdBelow,
    cellIdToLeft,
    rowDisabled
  };
};
