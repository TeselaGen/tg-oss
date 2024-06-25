export const getLastSelectedEntity = idMap => {
  let lastSelectedEnt;
  let latestTime;
  idMap.forEach(({ time, entity }) => {
    if (!latestTime || time > latestTime) {
      lastSelectedEnt = entity;
      latestTime = time;
    }
  });
  return lastSelectedEnt;
};
