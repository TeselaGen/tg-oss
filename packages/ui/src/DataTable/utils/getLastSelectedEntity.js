export const getLastSelectedEntity = idMap => {
  let lastSelectedEnt;
  let latestTime;
  Object.values(idMap).forEach(({ time, entity }) => {
    if (!latestTime || time > latestTime) {
      lastSelectedEnt = entity;
      latestTime = time;
    }
  });
  return lastSelectedEnt;
};
