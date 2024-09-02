import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change, initialize } from "redux-form";

export const useTableEntities = tableFormName => {
  const dispatch = useDispatch();
  const selectTableEntities = useCallback(
    (entities = []) => {
      initialize(tableFormName, {}, true, {
        keepDirty: true,
        updateUnregisteredFields: true,
        keepValues: true
      });
      const selectedEntityIdMap = {};
      entities.forEach(entity => {
        selectedEntityIdMap[entity.id] = {
          entity,
          time: Date.now()
        };
      });
      dispatch(
        change(
          tableFormName,
          "reduxFormSelectedEntityIdMap",
          selectedEntityIdMap
        )
      );
    },
    [dispatch, tableFormName]
  );

  const { allOrderedEntities = [], selectedEntities = {} } = useSelector(
    state => ({
      allOrderedEntities:
        state.form?.[tableFormName]?.values?.allOrderedEntities,
      selectedEntities:
        state.form?.[tableFormName]?.values?.reduxFormSelectedEntityIdMap
    })
  );
  return { selectTableEntities, allOrderedEntities, selectedEntities };
};
