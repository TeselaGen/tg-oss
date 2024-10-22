export const getNewEntToSelect = ({
  type,
  lastSelectedIndex,
  entities,
  isEntityDisabled
}) => {
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
    });
  } else {
    return newEntToSelect;
  }
};
