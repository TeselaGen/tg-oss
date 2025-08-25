import { isEmpty, omit, times } from "lodash-es";
import { VIRTUALIZE_CUTOFF_LENGTH } from "@teselagen/react-table";
import { applyPatches } from "immer";
import { editCellHelper } from "../editCellHelper";
import { useHotkeys } from "@blueprintjs/core";
import { getEntityIdToEntity, getFieldPathToIndex } from "./utils";
import { getAllRows } from "./getAllRows";
import { getRowCopyText } from "./getRowCopyText";
import { handleCopyHelper } from "./handleCopyHelper";
import { getRecordsFromIdMap } from "./withSelectedEntities";
import { getLastSelectedEntity } from "./getLastSelectedEntity";
import { getNewEntToSelect } from "./getNewEntToSelect";
import { getIdOrCodeOrIndex } from "./getIdOrCodeOrIndex";
import { finalizeSelection } from "./rowClick";

const IS_LINUX = window.navigator.platform.toLowerCase().search("linux") > -1;

export const useHotKeysWrapper = ({
  change,
  entities,
  entitiesUndoRedoStack,
  formatAndValidateEntities,
  handleCopySelectedRows,
  isCellEditable,
  isEntityDisabled,
  isSingleSelect,
  noDeselectAll,
  noSelect,
  onDeselect,
  onMultiRowSelect,
  onRowSelect,
  onSingleRowSelect,
  primarySelectedCellId,
  reduxFormCellValidation,
  reduxFormSelectedEntityIdMap,
  schema,
  selectedCells,
  setEntitiesUndoRedoStack,
  setNoVirtual,
  setSelectedCells,
  startCellEdit,
  tableRef,
  updateEntitiesHelper,
  updateValidation,
  waitUntilAllRowsAreRendered
}) => {
  const flashTableBorder = () => {
    try {
      const table = tableRef.current.tableRef;
      table.classList.add("tgBorderBlue");
      setTimeout(() => {
        table.classList.remove("tgBorderBlue");
      }, 300);
    } catch (e) {
      console.error(`err when flashing table border:`, e);
    }
  };

  const handleCopySelectedCells = async () => {
    // if the current selection is consecutive cells then copy with
    // tabs between. if not then just select primary selected cell
    if (isEmpty(selectedCells)) return;

    // Temporarily disable virtualization for large tables
    if (entities.length > VIRTUALIZE_CUTOFF_LENGTH) {
      setNoVirtual(true);
      await waitUntilAllRowsAreRendered();
    }

    const pathToIndex = getFieldPathToIndex(schema);
    const entityIdToEntity = getEntityIdToEntity(entities);
    const selectionGrid = [];
    let firstRowIndex;
    let firstCellIndex;
    Object.keys(selectedCells).forEach(key => {
      const [rowId, path] = key.split(":");
      const eInfo = entityIdToEntity[rowId];
      if (eInfo) {
        if (firstRowIndex === undefined || eInfo.i < firstRowIndex) {
          firstRowIndex = eInfo.i;
        }
        if (!selectionGrid[eInfo.i]) {
          selectionGrid[eInfo.i] = [];
        }
        const cellIndex = pathToIndex[path];
        if (firstCellIndex === undefined || cellIndex < firstCellIndex) {
          firstCellIndex = cellIndex;
        }
        selectionGrid[eInfo.i][cellIndex] = true;
      }
    });
    if (firstRowIndex === undefined) return;
    const allRows = getAllRows(tableRef);
    let fullCellText = "";
    const fullJson = [];
    times(selectionGrid.length, i => {
      const row = selectionGrid[i];
      if (fullCellText) {
        fullCellText += "\n";
      }
      if (!row) {
        return;
      } else {
        const jsonRow = [];
        // ignore header
        let [rowCopyText, json] = getRowCopyText(allRows[i + 1]);
        rowCopyText = rowCopyText.split("\t");
        times(row.length, i => {
          const cell = row[i];
          if (cell) {
            fullCellText += rowCopyText[i];
            jsonRow.push(json[i]);
          }
          if (i !== row.length - 1 && i >= firstCellIndex) fullCellText += "\t";
        });
        fullJson.push(jsonRow);
      }
    });
    if (!fullCellText) return window.toastr.warning("No text to copy");

    handleCopyHelper(fullCellText, fullJson, "Selected cells copied");

    // Re-enable virtualization if it was disabled
    setNoVirtual(false);
  };

  const handleCopyHotkey = e => {
    if (isCellEditable) {
      handleCopySelectedCells(e);
    } else {
      handleCopySelectedRows(
        getRecordsFromIdMap(reduxFormSelectedEntityIdMap),
        e
      );
    }
  };

  const handleDeleteCell = () => {
    const newCellValidate = {
      ...reduxFormCellValidation
    };
    if (isEmpty(selectedCells)) return;
    const rowIds = [];
    updateEntitiesHelper(entities, entities => {
      const entityIdToEntity = getEntityIdToEntity(entities);
      Object.keys(selectedCells).forEach(cellId => {
        const [rowId, path] = cellId.split(":");
        rowIds.push(rowId);
        const entity = entityIdToEntity[rowId].e;
        delete entity._isClean;
        const { error } = editCellHelper({
          entity,
          path,
          schema,
          newVal: ""
        });
        if (error) {
          newCellValidate[cellId] = error;
        } else {
          delete newCellValidate[cellId];
        }
      });
      updateValidation(entities, newCellValidate);
    });
  };

  const handleRowMove = (type, shiftHeld) => e => {
    e.preventDefault();
    e.stopPropagation();
    let newIdMap = {};
    const lastSelectedEnt = getLastSelectedEntity(reduxFormSelectedEntityIdMap);

    if (noSelect) return;
    if (lastSelectedEnt) {
      let lastSelectedIndex = entities.findIndex(
        ent => ent === lastSelectedEnt
      );
      if (lastSelectedIndex === -1) {
        if (lastSelectedEnt.id !== undefined) {
          lastSelectedIndex = entities.findIndex(
            ent => ent.id === lastSelectedEnt.id
          );
        } else if (lastSelectedEnt.code !== undefined) {
          lastSelectedIndex = entities.findIndex(
            ent => ent.code === lastSelectedEnt.code
          );
        }
      }
      if (lastSelectedIndex === -1) {
        return;
      }
      const newEntToSelect = getNewEntToSelect({
        type,
        lastSelectedIndex,
        entities,
        isEntityDisabled
      });

      if (!newEntToSelect) return;
      if (shiftHeld && !isSingleSelect) {
        if (
          reduxFormSelectedEntityIdMap[newEntToSelect.id || newEntToSelect.code]
        ) {
          //the entity being moved to has already been selected
          newIdMap = omit(reduxFormSelectedEntityIdMap, [
            lastSelectedEnt.id || lastSelectedEnt.code
          ]);
          newIdMap[newEntToSelect.id || newEntToSelect.code].time =
            Date.now() + 1;
        } else {
          //the entity being moved to has NOT been selected yet
          newIdMap = {
            ...reduxFormSelectedEntityIdMap,
            [newEntToSelect.id || newEntToSelect.code]: {
              entity: newEntToSelect,
              time: Date.now()
            }
          };
        }
      } else {
        //no shiftHeld
        newIdMap[newEntToSelect.id || newEntToSelect.code] = {
          entity: newEntToSelect,
          time: Date.now()
        };
      }
    }

    finalizeSelection({
      idMap: newIdMap,
      entities,
      props: {
        onDeselect,
        onSingleRowSelect,
        onMultiRowSelect,
        noDeselectAll,
        onRowSelect,
        noSelect,
        change
      }
    });
  };

  const handleSelectAllRows = e => {
    if (isSingleSelect) return;
    e.preventDefault();

    if (isCellEditable) {
      const schemaPaths = schema.fields.map(f => f.path);
      const newSelectedCells = {};
      entities.forEach((entity, i) => {
        if (isEntityDisabled(entity)) return;
        const entityId = getIdOrCodeOrIndex(entity, i);
        schemaPaths.forEach(p => {
          newSelectedCells[`${entityId}:${p}`] = true;
        });
      });
      setSelectedCells(newSelectedCells);
    } else {
      const newIdMap = {};

      entities.forEach((entity, i) => {
        if (isEntityDisabled(entity)) return;
        const entityId = getIdOrCodeOrIndex(entity, i);
        newIdMap[entityId] = { entity };
      });
      finalizeSelection({
        idMap: newIdMap,
        entities,
        props: {
          onDeselect,
          onSingleRowSelect,
          onMultiRowSelect,
          noDeselectAll,
          onRowSelect,
          noSelect,
          change
        }
      });
    }
  };

  return useHotkeys([
    {
      global: false,
      combo: "up",
      label: "Move Up a Row",
      onKeyDown: handleRowMove("up")
    },
    {
      global: false,
      combo: "down",
      label: "Move Down a Row",
      onKeyDown: handleRowMove("down")
    },
    {
      global: false,
      combo: "up+shift",
      label: "Move Up a Row",
      onKeyDown: handleRowMove("up", true)
    },
    ...(isCellEditable
      ? [
          {
            global: false,
            combo: "enter",
            label: "Enter -> Start Cell Edit",
            onKeyDown: e => {
              e.stopPropagation();
              startCellEdit(primarySelectedCellId);
            }
          },
          {
            global: false,
            combo: "mod+x",
            label: "Cut",
            onKeyDown: e => {
              handleDeleteCell();
              handleCopyHotkey(e);
            }
          },
          {
            global: false,
            combo: IS_LINUX ? "alt+z" : "mod+z",
            label: "Undo",
            onKeyDown: () => {
              if (entitiesUndoRedoStack.currentVersion > 0) {
                flashTableBorder();
                const nextState = applyPatches(
                  entities,
                  entitiesUndoRedoStack[entitiesUndoRedoStack.currentVersion]
                    .inversePatches
                );
                const { newEnts, validationErrors } =
                  formatAndValidateEntities(nextState);
                setEntitiesUndoRedoStack(prev => ({
                  ...prev,
                  currentVersion: prev.currentVersion - 1
                }));
                updateValidation(newEnts, validationErrors);
                change("reduxFormEntities", newEnts);
              }
            }
          },
          {
            global: false,
            combo: IS_LINUX ? "alt+shift+z" : "mod+shift+z",
            label: "Redo",
            onKeyDown: () => {
              const nextV = entitiesUndoRedoStack.currentVersion + 1;
              if (entitiesUndoRedoStack[nextV]) {
                flashTableBorder();
                const nextState = applyPatches(
                  entities,
                  entitiesUndoRedoStack[nextV].patches
                );
                const { newEnts, validationErrors } =
                  formatAndValidateEntities(nextState);
                change("reduxFormEntities", newEnts);
                updateValidation(newEnts, validationErrors);
                setEntitiesUndoRedoStack(prev => ({
                  ...prev,
                  currentVersion: nextV
                }));
              }
            }
          },
          {
            global: false,
            combo: "backspace",
            label: "Delete Cell",
            onKeyDown: handleDeleteCell
          }
        ]
      : []),
    {
      global: false,
      combo: "down+shift",
      label: "Move Down a Row",
      onKeyDown: handleRowMove("down", true)
    },
    {
      global: false,
      combo: "mod + c",
      label: "Copy rows",
      onKeyDown: handleCopyHotkey
    },
    {
      global: false,
      combo: "mod + a",
      label: "Select rows",
      onKeyDown: handleSelectAllRows
    }
  ]);
};
