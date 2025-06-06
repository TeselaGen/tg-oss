import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change, initialize } from "redux-form";

type _Entity = { [key: string]: unknown } & { id: string };

type SelectedEntityIdMap<Entity extends _Entity> = Record<
  string,
  { entity: Entity; time: number; index?: number }
>;

export const useTableEntities = <Entity extends _Entity>(
  tableFormName: string
) => {
  const dispatch = useDispatch();
  const selectTableEntities = useCallback(
    (entities: { id: string }[] = []) => {
      initialize(tableFormName, {}, true, {
        keepDirty: true,
        updateUnregisteredFields: true,
        keepValues: true
      });
      const selectedEntityIdMap: SelectedEntityIdMap<{ id: string }> = {};
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

  const { allOrderedEntities, selectedEntities } = useSelector(
    (state: {
      form: Record<
        string,
        {
          values?: {
            allOrderedEntities?: Entity[];
            reduxFormSelectedEntityIdMap?: SelectedEntityIdMap<Entity>;
          };
        }
      >;
    }) => ({
      allOrderedEntities:
        state.form?.[tableFormName]?.values?.allOrderedEntities,
      selectedEntities:
        state.form?.[tableFormName]?.values?.reduxFormSelectedEntityIdMap
    })
  );
  return { selectTableEntities, allOrderedEntities, selectedEntities };
};
