import { Entity } from "./types/Entity";

export const getNewEntToSelect = ({
  type,
  lastSelectedIndex,
  entities,
  isEntityDisabled
}: {
  type: "up" | "down";
  lastSelectedIndex: number;
  entities: Entity[];
  isEntityDisabled?: (entity: Entity) => boolean;
}): Entity | undefined => {
  let newIndexToSelect;
  if (type === "up") {
    newIndexToSelect = lastSelectedIndex - 1;
  } else {
    newIndexToSelect = lastSelectedIndex + 1;
  }
  const newEntToSelect = entities[newIndexToSelect];
  if (!newEntToSelect) return;
  if (isEntityDisabled && isEntityDisabled(newEntToSelect)) {
    return getNewEntToSelect({
      type,
      lastSelectedIndex: newIndexToSelect,
      entities,
      isEntityDisabled
    }) as Entity;
  } else {
    return newEntToSelect;
  }
};
