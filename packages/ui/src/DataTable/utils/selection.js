import getIdOrCodeOrIndex from "./getIdOrCodeOrIndex";

export const getSelectedRowsFromEntities = (entities, idMap) => {
  if (!idMap) return [];
  return entities.reduce((acc, entity, i) => {
    return idMap[getIdOrCodeOrIndex(entity, i)] ? acc.concat(i) : acc;
  }, []);
};
