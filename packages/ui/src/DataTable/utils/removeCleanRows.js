import { isEntityClean } from "./isEntityClean";
import { getIdOrCodeOrIndex } from "./getIdOrCodeOrIndex";

export const removeCleanRows = (entities, cellValidation) => {
  const toFilterOut = {};
  const entsToUse = (entities || []).filter(e => {
    if (!(e._isClean || isEntityClean(e))) return true;
    else {
      toFilterOut[getIdOrCodeOrIndex(e)] = true;
      return false;
    }
  });

  const validationToUse = {};
  Object.entries(cellValidation || {}).forEach(([k, v]) => {
    const [rowId] = k.split(":");
    if (!toFilterOut[rowId]) {
      validationToUse[k] = v;
    }
  });
  return { entsToUse, validationToUse };
};
