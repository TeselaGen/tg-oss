import { isEmpty, forEach, range } from "lodash-es";
import { getSelectedRowsFromEntities } from "./selection";
import getIdOrCodeOrIndex from "./getIdOrCodeOrIndex";
import { getRecordsFromIdMap } from "./withSelectedEntities";

export default function rowClick(e, rowInfo, entities, props) {
  const {
    reduxFormSelectedEntityIdMap,
    isSingleSelect,
    noSelect,
    onRowClick,
    isEntityDisabled,
    withCheckboxes
  } = props;
  const entity = rowInfo.original;
  onRowClick(e, entity, rowInfo);
  if (noSelect || isEntityDisabled(entity)) return;
  const rowId = getIdOrCodeOrIndex(entity, rowInfo.index);
  if (rowId === undefined) return;
  const ctrl = e.metaKey || e.ctrlKey || (withCheckboxes && !e.shiftKey);
  const oldIdMap = reduxFormSelectedEntityIdMap || {};
  const rowSelected = oldIdMap[rowId];
  let newIdMap = {
    [rowId]: {
      time: Date.now(),
      entity
    }
  };

  if (isSingleSelect) {
    if (rowSelected) newIdMap = {};
  } else if (rowSelected && e.shiftKey) return;
  else if (rowSelected && ctrl) {
    newIdMap = {
      ...oldIdMap
    };
    delete newIdMap[rowId];
  } else if (rowSelected) {
    newIdMap = {};
  } else if (ctrl) {
    newIdMap = {
      ...oldIdMap,
      ...newIdMap
    };
  } else if (e.shiftKey && !isEmpty(oldIdMap)) {
    newIdMap = {
      [rowId]: {
        entity,
        time: Date.now()
      }
    };
    const currentlySelectedRowIndices = getSelectedRowsFromEntities(
      entities,
      oldIdMap
    );
    if (currentlySelectedRowIndices.length) {
      let timeToBeat = {
        id: null,
        time: null
      };
      forEach(oldIdMap, ({ time }, key) => {
        if (time && time > timeToBeat.time)
          timeToBeat = {
            id: key,
            time
          };
      });
      const mostRecentlySelectedIndex = entities.findIndex((e, i) => {
        let id = getIdOrCodeOrIndex(e, i);
        if (!id && id !== 0) id = "";
        return id.toString() === timeToBeat.id;
      });

      if (mostRecentlySelectedIndex !== -1) {
        const highRange =
          rowInfo.index < mostRecentlySelectedIndex
            ? mostRecentlySelectedIndex - 1
            : rowInfo.index;
        const lowRange =
          rowInfo.index > mostRecentlySelectedIndex
            ? mostRecentlySelectedIndex + 1
            : rowInfo.index;
        range(lowRange, highRange + 1).forEach(i => {
          if (isEntityDisabled && isEntityDisabled(entities[i])) {
            return;
          }
          const recordId = entities[i] && getIdOrCodeOrIndex(entities[i], i);
          if (recordId || recordId === 0)
            // newIdMap[recordId] = { entity: entities[i] };
            newIdMap[recordId] = { entity: entities[i], time: Date.now() };
        });
        newIdMap = {
          ...oldIdMap,
          ...newIdMap
        };
        if (newIdMap[rowId]) {
          //the entity we just clicked on should have the "freshest" time
          newIdMap[rowId].time = Date.now() + 1;
        }
      }
    }
  }

  finalizeSelection({ idMap: newIdMap, entities, props });
}

export function changeSelectedEntities({ idMap, entities = [], change }) {
  const newIdMap = { ...idMap };
  const entityIdToIndex = {};
  entities.forEach((e, i) => {
    entityIdToIndex[getIdOrCodeOrIndex(e, 0)] = i;
  });
  // we want to store the index of the entity so that it can be used to preserve order in selection
  Object.keys(newIdMap).forEach(key => {
    if (!newIdMap[key]) return;
    const rowIndex =
      entityIdToIndex[getIdOrCodeOrIndex(newIdMap[key].entity, 0)];
    newIdMap[key] = {
      ...newIdMap[key],
      rowIndex: rowIndex === undefined ? 10000000 : rowIndex
    };
  });

  change("reduxFormSelectedEntityIdMap", newIdMap);
}

export function finalizeSelection({ idMap, entities, props }) {
  const {
    onDeselect,
    onSingleRowSelect,
    onMultiRowSelect,
    noDeselectAll,
    onRowSelect,
    noSelect,
    change
  } = props;
  if (noSelect) return;
  if (
    noDeselectAll &&
    Object.keys(idMap).filter(id => {
      return idMap[id];
    }).length === 0
  ) {
    return;
  }

  changeSelectedEntities({ idMap, entities, change });
  const selectedRecords = getRecordsFromIdMap(idMap);
  onRowSelect(selectedRecords);

  selectedRecords.length === 0
    ? onDeselect()
    : selectedRecords.length > 1
      ? onMultiRowSelect(selectedRecords)
      : onSingleRowSelect(selectedRecords[0]);
}
