import { Entity } from "./types/Entity";

export const getLastSelectedEntity = (idMap: {
  [id: string]: { time: number; entity: Entity };
}) => {
  let lastSelectedEnt;
  let latestTime: number | null = null;
  Object.values(idMap).forEach(({ time, entity }) => {
    if (!latestTime || time > latestTime) {
      lastSelectedEnt = entity;
      latestTime = time;
    }
  });
  return lastSelectedEnt;
};
