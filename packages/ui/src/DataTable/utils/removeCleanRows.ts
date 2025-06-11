import { isEntityClean } from "./isEntityClean";
import { getIdOrCodeOrIndex } from "./getIdOrCodeOrIndex";
import { Entity } from "./types/Entity";

export const removeCleanRows = (
  entities: Entity[],
  cellValidation: Record<string, unknown>
) => {
  const toFilterOut: Record<string, boolean> = {};
  const entsToUse = (entities || []).filter(e => {
    if (!(e._isClean || isEntityClean(e))) return true;
    else {
      toFilterOut[getIdOrCodeOrIndex(e)] = true;
      return false;
    }
  });

  const validationToUse: Record<string, unknown> = {};
  Object.entries(cellValidation || {}).forEach(([k, v]) => {
    const [rowId] = k.split(":");
    if (!toFilterOut[rowId]) {
      validationToUse[k] = v;
    }
  });
  return { entsToUse, validationToUse };
};
