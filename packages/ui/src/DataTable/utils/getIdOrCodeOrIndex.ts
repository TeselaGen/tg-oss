import type { Entity } from "./types/Entity";

export const getIdOrCodeOrIndex = (record: Entity, rowIndex?: number) => {
  if ("id" in record && (record.id || record.id === 0)) {
    return record.id;
  } else if ("code" in record && record.code) {
    return record.code;
  } else {
    if (rowIndex === undefined || rowIndex === null) {
      throw new Error("id, code, or rowIndex must be provided");
    }
    return rowIndex;
  }
};
