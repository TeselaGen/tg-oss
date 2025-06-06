import { getIdOrCodeOrIndex } from "./getIdOrCodeOrIndex";

export const getSelectedRowsFromEntities = (
  entities: { [key: string]: unknown }[],
  idMap: Record<string, boolean>
) => {
  if (!idMap) return [];
  return entities.reduce((acc: number[], entity, i) => {
    return idMap[getIdOrCodeOrIndex(entity, i)] ? acc.concat([i]) : acc;
  }, []);
};
