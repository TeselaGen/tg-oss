import React, { isValidElement, useCallback } from "react";
import classNames from "classnames";
import { Button, Classes, Checkbox, Icon } from "@blueprintjs/core";
import {
  set,
  toString,
  camelCase,
  startCase,
  noop,
  cloneDeep,
  get,
  padStart
} from "lodash-es";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import joinUrl from "url-join";
import InfoHelper from "../InfoHelper";
import {
  getEntityIdToEntity,
  getFieldPathToIndex,
  getFieldPathToField,
  getIdOrCodeOrIndex,
  getNumberStrAtEnd,
  getSelectedRowsFromEntities,
  PRIMARY_SELECTED_VAL,
  stripNumberAtEnd
} from "./utils";
import FilterAndSortMenu from "./FilterAndSortMenu";
import { ColumnFilterMenu } from "./ColumnFilterMenu";
import getTextFromEl from "../utils/getTextFromEl";
import rowClick, { finalizeSelection } from "./utils/rowClick";
import { editCellHelper } from "./editCellHelper";
import { getCellVal } from "./getCellVal";
import { useDispatch } from "react-redux";
import { change as _change } from "redux-form";
import { RenderCell } from "./RenderCell";
import { getCCDisplayName } from "./utils/tableQueryParamsToHasuraClauses";
import { showContextMenu } from "../utils/menuUtils";

dayjs.extend(localizedFormat);

const RenderColumnHeader = ({
  recordIdToIsVisibleMap,
  setRecordIdToIsVisibleMap,
  addFilters,
  column,
  compact,
  currentParams,
  entities,
  extraCompact,
  filters,
  resetDefaultVisibility,
  onlyOneVisibleColumn,
  formName,
  isCellEditable,
  updateColumnVisibility,
  schema,
  withDisplayOptions,
  isLocalCall,
  order,
  removeSingleFilter,
  setNewParams,
  setOrder,
  updateEntitiesHelper,
  withFilter,
  withSort
}) => {
  const {
    displayName,
    description,
    isUnique,
    sortDisabled,
    filterDisabled,
    columnFilterDisabled,
    renderTitleInner,
    filterIsActive = noop,
    noTitle,
    isNotEditable,
    type,
    path,
    columnHeader
  } = column;
  const columnDataType = column.type;
  const isActionColumn = columnDataType === "action";
  const disableSorting =
    sortDisabled ||
    isActionColumn ||
    (!isLocalCall && typeof path === "string" && path.includes(".")) ||
    columnDataType === "color";
  const disableFiltering =
    filterDisabled ||
    columnDataType === "color" ||
    isActionColumn ||
    columnFilterDisabled;
  const ccDisplayName = getCCDisplayName(column);
  let columnTitle = displayName || startCase(camelCase(path));
  if (isActionColumn) columnTitle = "";

  const currentFilter =
    filters &&
    !!filters.length &&
    filters.filter(({ filterOn }) => {
      return filterOn === ccDisplayName;
    })[0];
  const filterActiveForColumn =
    !!currentFilter || filterIsActive(currentParams);
  let ordering;
  if (order && order.length) {
    order.forEach(order => {
      const orderField = order.replace("-", "");
      if (orderField === path) {
        if (orderField === order) {
          ordering = "asc";
        } else {
          ordering = "desc";
        }
      }
    });
  }

  const sortDown = ordering && ordering === "asc";
  const sortUp = ordering && !sortDown;
  const FilterMenu = column.FilterMenu || FilterAndSortMenu;

  let maybeCheckbox;
  if (isCellEditable && !isNotEditable && type === "boolean") {
    let isIndeterminate = false;
    let isChecked = !!entities.length;
    let hasFalse;
    let hasTrue;
    entities.some(e => {
      if (!get(e, path)) {
        isChecked = false;
        hasFalse = true;
      } else {
        hasTrue = true;
      }
      if (hasFalse && hasTrue) {
        isIndeterminate = true;
        return true;
      }
      return false;
    });
    maybeCheckbox = (
      <Checkbox
        style={{ marginBottom: 0, marginLeft: 3 }}
        onChange={() => {
          updateEntitiesHelper(entities, ents => {
            ents.forEach(e => {
              delete e._isClean;
              set(e, path, isIndeterminate ? true : !isChecked);
            });
          });
        }}
        indeterminate={isIndeterminate}
        checked={isChecked}
      />
    );
  }

  const columnTitleTextified = getTextFromEl(columnTitle);

  return (
    <div
      {...(description && {
        "data-tip": `<div>
          <strong>${columnTitle}:</strong> <br>
          ${description} ${isUnique ? "<br>Must be unique" : ""}</div>`
      })}
      onContextMenu={e => {
        if (!withDisplayOptions) {
          return;
        }
        e.preventDefault();
        e.persist();
        showContextMenu(
          [
            {
              text: "Hide Column",
              disabled: onlyOneVisibleColumn,
              icon: "eye-off",
              onClick: () => {
                updateColumnVisibility({
                  shouldShow: false,
                  path
                });
              }
            },
            {
              text: "Hide Other Columns",
              icon: "eye-off",
              onClick: () => {
                updateColumnVisibility({
                  shouldShow: false,
                  paths: schema.fields
                    .map(c => c.path)
                    .filter(Boolean)
                    .filter(p => p !== path)
                });
              }
            },
            {
              text: "Reset Column Visibilities",
              icon: "reset",
              onClick: () => {
                resetDefaultVisibility();
              }
            },
            {
              text: "Table Display Options",
              icon: "cog",
              onClick: () => {
                e.target
                  .closest(".data-table-container")
                  ?.querySelector(".tg-table-display-options")
                  ?.click();
              }
            }
          ],
          undefined,
          e
        );
      }}
      data-test={columnTitleTextified}
      data-path={path}
      data-copy-text={columnTitleTextified}
      data-copy-json={JSON.stringify({
        __strVal: columnTitleTextified,
        __isHeaderCell: true
      })}
      className={classNames("tg-react-table-column-header", {
        "sort-active": sortUp || sortDown
      })}
    >
      {columnHeader &&
        columnHeader({
          recordIdToIsVisibleMap,
          setRecordIdToIsVisibleMap,
          addFilters,
          column,
          compact,
          currentParams,
          entities,
          extraCompact,
          filters,
          formName,
          isCellEditable,
          isLocalCall,
          order,
          removeSingleFilter,
          setNewParams,
          setOrder,
          updateEntitiesHelper,
          withFilter,
          withSort
        })}
      {columnTitleTextified && !noTitle && (
        <>
          {maybeCheckbox}
          <span
            title={columnTitleTextified}
            className={classNames({
              "tg-react-table-name": true,
              "no-data-tip": !!description
            })}
            style={{
              ...(description && { fontStyle: "italic" }),
              display: "inline-block"
            }}
          >
            {renderTitleInner ? renderTitleInner : columnTitle}{" "}
          </span>
        </>
      )}
      <div
        style={{ display: "flex", marginLeft: "auto", alignItems: "center" }}
      >
        {withSort && !disableSorting && (
          <div className="tg-sort-arrow-container">
            <Icon
              data-tip="Sort Z-A (Hold shift to sort multiple columns)"
              icon="chevron-up"
              className={classNames({
                active: sortUp
              })}
              color={sortUp ? "#106ba3" : undefined}
              iconSize={extraCompact ? 10 : 12}
              onClick={e => {
                setOrder("-" + ccDisplayName, sortUp, e.shiftKey);
              }}
            />
            <Icon
              data-tip="Sort A-Z (Hold shift to sort multiple columns)"
              icon="chevron-down"
              className={classNames({
                active: sortDown
              })}
              color={sortDown ? "#106ba3" : undefined}
              iconSize={extraCompact ? 10 : 12}
              onClick={e => {
                setOrder(ccDisplayName, sortDown, e.shiftKey);
              }}
            />
          </div>
        )}
        {withFilter && !disableFiltering && (
          <ColumnFilterMenu
            formName={formName}
            FilterMenu={FilterMenu}
            filterActiveForColumn={filterActiveForColumn}
            addFilters={addFilters}
            removeSingleFilter={removeSingleFilter}
            currentFilter={currentFilter}
            filterOn={ccDisplayName}
            dataType={columnDataType}
            schemaForField={column}
            currentParams={currentParams}
            setNewParams={setNewParams}
            compact={compact}
            extraCompact={extraCompact}
          />
        )}
      </div>
    </div>
  );
};

const renderCheckboxHeader = ({
  change,
  entities,
  isEntityDisabled,
  isSingleSelect,
  noDeselectAll,
  noSelect,
  noUserSelect = false,
  onDeselect,
  onMultiRowSelect,
  onRowSelect,
  onSingleRowSelect,
  reduxFormSelectedEntityIdMap
}) => {
  const checkedRows = getSelectedRowsFromEntities(
    entities,
    reduxFormSelectedEntityIdMap
  );
  const checkboxProps = {
    checked: false,
    indeterminate: false
  };
  const notDisabledEntityCount = entities.reduce((acc, e) => {
    return isEntityDisabled(e) ? acc : acc + 1;
  }, 0);
  if (checkedRows.length === notDisabledEntityCount) {
    //tnr: maybe this will need to change if we want enable select all across pages
    checkboxProps.checked = notDisabledEntityCount !== 0;
  } else {
    if (checkedRows.length) {
      checkboxProps.indeterminate = true;
    }
  }

  return !isSingleSelect ? (
    <Checkbox
      name="checkBoxHeader"
      disabled={noSelect || noUserSelect}
      onChange={() => {
        const newIdMap = cloneDeep(reduxFormSelectedEntityIdMap) || {};
        entities.forEach((entity, i) => {
          if (isEntityDisabled(entity)) return;
          const entityId = getIdOrCodeOrIndex(entity, i);
          if (checkboxProps.checked) {
            delete newIdMap[entityId];
          } else {
            newIdMap[entityId] = { entity };
          }
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
      }}
      {...checkboxProps}
    />
  ) : null;
};

export const useColumns = ({
  addFilters,
  cellRenderer,
  columns,
  resetDefaultVisibility,
  currentParams,
  compact,
  editingCell,
  editingCellSelectAll,
  entities,
  expandedEntityIdMap,
  extraCompact,
  filters,
  formName,
  getCellHoverText,
  isCellEditable,
  isEntityDisabled,
  isLocalCall,
  isSimple,
  isSingleSelect,
  isSelectionARectangle,
  noDeselectAll,
  noSelect,
  noUserSelect,
  onDeselect,
  onMultiRowSelect,
  onRowClick,
  onRowSelect,
  onSingleRowSelect,
  order,
  primarySelectedCellId,
  reduxFormCellValidation,
  reduxFormSelectedEntityIdMap,
  refocusTable,
  removeSingleFilter = noop,
  schema,
  selectedCells,
  setExpandedEntityIdMap,
  setNewParams,
  updateColumnVisibility,
  setOrder = noop,
  setSelectedCells,
  shouldShowSubComponent,
  startCellEdit,
  SubComponent,
  tableRef,
  updateEntitiesHelper,
  updateValidation,
  withCheckboxes,
  withExpandAndCollapseAllButton,
  withFilter: _withFilter,
  withSort = true,
  recordIdToIsVisibleMap,
  setRecordIdToIsVisibleMap,
  withDisplayOptions
}) => {
  const dispatch = useDispatch();
  const change = useCallback(
    (...args) => dispatch(_change(formName, ...args)),
    [dispatch, formName]
  );
  const withFilter = _withFilter === undefined ? !isSimple : _withFilter;

  const onDragEnd = useCallback(
    cellsToSelect => {
      const [primaryRowId, primaryCellPath] = primarySelectedCellId.split(":");
      const pathToField = getFieldPathToField(schema);
      const { selectedPaths, selectionGrid } = isSelectionARectangle();
      let allSelectedPaths = selectedPaths;
      if (!allSelectedPaths) {
        allSelectedPaths = [primaryCellPath];
      }

      updateEntitiesHelper(entities, entities => {
        let newSelectedCells;
        if (selectedPaths) {
          newSelectedCells = {
            ...selectedCells
          };
        } else {
          newSelectedCells = {
            [primarySelectedCellId]: PRIMARY_SELECTED_VAL
          };
        }

        const newCellValidate = {
          ...reduxFormCellValidation
        };
        const entityMap = getEntityIdToEntity(entities);
        const { e: selectedEnt } = entityMap[primaryRowId];
        const firstCellToSelectRowIndex =
          entityMap[cellsToSelect[0]?.split(":")[0]]?.i;
        const pathToIndex = getFieldPathToIndex(schema);

        allSelectedPaths.forEach(selectedPath => {
          const column = pathToField[selectedPath];

          const selectedCellVal = getCellVal(selectedEnt, selectedPath, column);
          const cellIndexOfSelectedPath = pathToIndex[selectedPath];
          let incrementStart;
          let incrementPrefix;
          let incrementPad = 0;
          if (column.type === "string" || column.type === "number") {
            const cellNumStr = getNumberStrAtEnd(selectedCellVal);
            const cellNum = Number(cellNumStr);
            const entityAbovePrimaryCell =
              entities[entityMap[primaryRowId].i - 1];
            if (cellNumStr !== null && !isNaN(cellNum)) {
              if (
                entityAbovePrimaryCell &&
                (!selectionGrid || selectionGrid.length <= 1)
              ) {
                const cellAboveVal = get(
                  entityAbovePrimaryCell,
                  selectedPath,
                  ""
                );
                const cellAboveNumStr = getNumberStrAtEnd(cellAboveVal);
                const cellAboveNum = Number(cellAboveNumStr);
                if (!isNaN(cellAboveNum)) {
                  const isIncremental = cellNum - cellAboveNum === 1;
                  if (isIncremental) {
                    const cellTextNoNum = stripNumberAtEnd(selectedCellVal);
                    const sameText =
                      stripNumberAtEnd(cellAboveVal) === cellTextNoNum;
                    if (sameText) {
                      incrementStart = cellNum + 1;
                      incrementPrefix = cellTextNoNum || "";
                      if (cellNumStr && cellNumStr.startsWith("0")) {
                        incrementPad = cellNumStr.length;
                      }
                    }
                  }
                }
              }
              if (incrementStart === undefined) {
                const draggingDown =
                  firstCellToSelectRowIndex > selectionGrid?.[0][0].rowIndex;
                if (selectedPaths && draggingDown) {
                  let checkIncrement;
                  let prefix;
                  let maybePad;
                  // determine if all the cells in this column of the selectionGrid are incrementing
                  const allAreIncrementing = selectionGrid.every(row => {
                    // see if cell is selected
                    const cellInfo = row[cellIndexOfSelectedPath];
                    if (!cellInfo) return false;
                    const { cellId } = cellInfo;
                    const [rowId] = cellId.split(":");
                    const cellVal = getCellVal(
                      entityMap[rowId].e,
                      selectedPath,
                      pathToField[selectedPath]
                    );
                    const cellNumStr = getNumberStrAtEnd(cellVal);
                    const cellNum = Number(cellNumStr);
                    const cellTextNoNum = stripNumberAtEnd(cellVal);
                    if (cellNumStr?.startsWith("0")) {
                      maybePad = cellNumStr.length;
                    }
                    if (cellTextNoNum && !prefix) {
                      prefix = cellTextNoNum;
                    }
                    if (cellTextNoNum && prefix !== cellTextNoNum) {
                      return false;
                    }
                    if (!isNaN(cellNum)) {
                      if (!checkIncrement) {
                        checkIncrement = cellNum;
                        return true;
                      } else {
                        return ++checkIncrement === cellNum;
                      }
                    } else {
                      return false;
                    }
                  });

                  if (allAreIncrementing) {
                    incrementStart = checkIncrement + 1;
                    incrementPrefix = prefix || "";
                    incrementPad = maybePad;
                  }
                }
              }
            }
          }

          let firstSelectedCellRowIndex;
          if (selectionGrid) {
            selectionGrid[0].some(cell => {
              if (cell) {
                firstSelectedCellRowIndex = cell.rowIndex;
                return true;
              }
              return false;
            });
          }

          cellsToSelect.forEach(cellId => {
            const [rowId, cellPath] = cellId.split(":");
            if (cellPath !== selectedPath) return;
            newSelectedCells[cellId] = true;
            const { e: entityToUpdate, i: rowIndex } = entityMap[rowId] || {};
            if (entityToUpdate) {
              delete entityToUpdate._isClean;
              let newVal;
              if (incrementStart !== undefined) {
                const num = incrementStart++;
                newVal = incrementPrefix + padStart(num, incrementPad, "0");
              } else {
                if (selectionGrid && selectionGrid.length > 1) {
                  // if there are multiple cells selected then we want to copy them repeating
                  // ex: if we have 1,2,3 selected and we drag for 5 more rows we want it to
                  // be 1,2,3,1,2 for the new row cells in this column
                  const draggingDown = rowIndex > firstSelectedCellRowIndex;
                  const cellIndex = pathToIndex[cellPath];
                  let cellIdToCopy;
                  if (draggingDown) {
                    const { cellId } = selectionGrid[
                      (rowIndex - firstSelectedCellRowIndex) %
                        selectionGrid.length
                    ].find(g => g && g.cellIndex === cellIndex);
                    cellIdToCopy = cellId;
                  } else {
                    const lastIndexInGrid =
                      selectionGrid[selectionGrid.length - 1][0].rowIndex;
                    const { cellId } = selectionGrid[
                      (rowIndex + lastIndexInGrid + 1) % selectionGrid.length
                    ].find(g => g.cellIndex === cellIndex);
                    cellIdToCopy = cellId;
                  }

                  const [rowIdToCopy, cellPathToCopy] = cellIdToCopy.split(":");
                  newVal = getCellVal(
                    entityMap[rowIdToCopy].e,
                    cellPathToCopy,
                    pathToField[cellPathToCopy]
                  );
                } else {
                  newVal = selectedCellVal;
                }
              }
              const { error } = editCellHelper({
                entity: entityToUpdate,
                path: cellPath,
                schema,
                newVal
              });
              newCellValidate[cellId] = error;
            }
          });
        });

        // select the new cells
        updateValidation(entities, newCellValidate);
        setSelectedCells(newSelectedCells);
      });
    },
    [
      entities,
      isSelectionARectangle,
      primarySelectedCellId,
      reduxFormCellValidation,
      schema,
      selectedCells,
      setSelectedCells,
      updateEntitiesHelper,
      updateValidation
    ]
  );

  const getCopyTextForCell = useCallback(
    (val, row = {}, column = {}) => {
      // TODOCOPY we need a way to potentially omit certain columns from being added as a \t element (talk to taoh about this)
      let text = typeof val !== "string" ? row.value : val;

      // We should try to take out the props from here, it produces
      // unnecessary rerenders
      const record = row.original;
      if (column.getClipboardData) {
        text = column.getClipboardData(row.value, record, row);
      } else if (column.getValueToFilterOn) {
        text = column.getValueToFilterOn(record);
      } else if (column.render) {
        text = column.render(row.value, record, row, {
          currentParams,
          setNewParams
        });
      } else if (cellRenderer && cellRenderer[column.path]) {
        text = cellRenderer[column.path](row.value, row.original, row, {
          currentParams,
          setNewParams
        });
      } else if (text) {
        text = isValidElement(text) ? text : String(text);
      }
      const getTextFromElementOrLink = text => {
        if (isValidElement(text)) {
          if (text.props?.to) {
            // this will convert Link elements to url strings
            return joinUrl(
              window.location.origin,
              window.frontEndConfig?.clientBasePath || "",
              text.props.to
            );
          } else {
            return getTextFromEl(text);
          }
        } else {
          return text;
        }
      };
      text = getTextFromElementOrLink(text);

      if (Array.isArray(text)) {
        let arrText = text.map(getTextFromElementOrLink).join(", ");
        // because we sometimes insert commas after links when mapping over an array of elements we will have double ,'s
        arrText = arrText.replace(/, ,/g, ",");
        text = arrText;
      }

      const stringText = toString(text);
      if (stringText === "[object Object]") return "";
      return stringText;
    },
    [cellRenderer, currentParams, setNewParams]
  );

  const renderCheckboxCell = useCallback(
    row => {
      const rowIndex = row.index;
      const checkedRows = getSelectedRowsFromEntities(
        entities,
        reduxFormSelectedEntityIdMap
      );

      const isSelected = checkedRows.some(rowNum => {
        return rowNum === rowIndex;
      });
      if (rowIndex >= entities.length) {
        return <div />;
      }
      const entity = entities[rowIndex];
      return (
        <Checkbox
          name={`${getIdOrCodeOrIndex(entity, rowIndex)}-checkbox`}
          disabled={noSelect || noUserSelect || isEntityDisabled(entity)}
          onClick={e => {
            rowClick(e, row, entities, {
              reduxFormSelectedEntityIdMap,
              isSingleSelect,
              noSelect,
              onRowClick,
              isEntityDisabled,
              withCheckboxes,
              onDeselect,
              onSingleRowSelect,
              onMultiRowSelect,
              noDeselectAll,
              onRowSelect,
              change
            });
          }}
          checked={isSelected}
        />
      );
    },
    [
      change,
      entities,
      isEntityDisabled,
      isSingleSelect,
      noDeselectAll,
      noSelect,
      noUserSelect,
      onDeselect,
      onMultiRowSelect,
      onRowClick,
      onRowSelect,
      onSingleRowSelect,
      reduxFormSelectedEntityIdMap,
      withCheckboxes
    ]
  );

  const finishCellEdit = useCallback(
    (cellId, newVal, doNotStopEditing) => {
      const [rowId, path] = cellId.split(":");
      !doNotStopEditing && change("reduxFormEditingCell", null);
      updateEntitiesHelper(entities, entities => {
        const entity = entities.find((e, i) => {
          return getIdOrCodeOrIndex(e, i) === rowId;
        });
        delete entity._isClean;
        const { error } = editCellHelper({
          entity,
          path,
          schema,
          newVal
        });

        updateValidation(entities, {
          ...reduxFormCellValidation,
          [cellId]: error
        });
      });
      !doNotStopEditing && refocusTable();
    },
    [
      change,
      entities,
      reduxFormCellValidation,
      refocusTable,
      schema,
      updateEntitiesHelper,
      updateValidation
    ]
  );

  const cancelCellEdit = useCallback(() => {
    change("reduxFormEditingCell", null);
    refocusTable();
  }, [change, refocusTable]);

  if (!columns.length) {
    return columns;
  }

  const columnsToRender = [];
  if (SubComponent) {
    columnsToRender.push({
      ...(withExpandAndCollapseAllButton && {
        Header: () => {
          const showCollapseAll =
            Object.values(expandedEntityIdMap).filter(i => i).length ===
            entities.length;
          return (
            <InfoHelper
              content={showCollapseAll ? "Collapse All" : "Expand All"}
              isButton
              minimal
              small
              style={{ padding: 2 }}
              popoverProps={{
                modifiers: {
                  preventOverflow: { enabled: false },
                  hide: { enabled: false }
                }
              }}
              onClick={() => {
                showCollapseAll
                  ? setExpandedEntityIdMap({})
                  : setExpandedEntityIdMap(prev => {
                      const newMap = { ...prev };
                      entities.forEach(e => {
                        newMap[getIdOrCodeOrIndex(e)] = true;
                      });
                      return newMap;
                    });
              }}
              className={classNames("tg-expander-all")}
              icon={showCollapseAll ? "chevron-down" : "chevron-right"}
            />
          );
        }
      }),
      expander: true,
      Expander: ({ isExpanded, original: record }) => {
        let shouldShow = true;
        if (shouldShowSubComponent) {
          shouldShow = shouldShowSubComponent(record);
        }
        if (!shouldShow) return null;
        return (
          <Button
            className={classNames(
              "tg-expander",
              Classes.MINIMAL,
              Classes.SMALL
            )}
            icon={isExpanded ? "chevron-down" : "chevron-right"}
          />
        );
      }
    });
  }

  if (withCheckboxes) {
    columnsToRender.push({
      Header: renderCheckboxHeader({
        change,
        entities,
        isEntityDisabled,
        isSingleSelect,
        noDeselectAll,
        noSelect,
        noUserSelect,
        onDeselect,
        onMultiRowSelect,
        onRowSelect,
        onSingleRowSelect,
        reduxFormSelectedEntityIdMap
      }),
      Cell: renderCheckboxCell,
      width: 35,
      resizable: false,
      getHeaderProps: () => {
        return {
          className: "tg-react-table-checkbox-header-container",
          immovable: "true"
        };
      },
      getProps: () => {
        return {
          className: "tg-react-table-checkbox-cell-container"
        };
      }
    });
  }

  const tableColumns = columns.map(column => {
    const tableColumn = {
      ...column,
      Header: RenderColumnHeader({
        onlyOneVisibleColumn: columns.length === 1,
        recordIdToIsVisibleMap,
        setRecordIdToIsVisibleMap,
        column,
        withDisplayOptions,
        isLocalCall,
        filters,
        currentParams,
        order,
        resetDefaultVisibility,
        setOrder,
        withSort,
        schema,
        updateColumnVisibility,
        formName,
        extraCompact,
        withFilter,
        addFilters,
        removeSingleFilter,
        setNewParams,
        compact,
        isCellEditable,
        entities,
        updateEntitiesHelper
      }),
      accessor: column.path,
      getHeaderProps: () => ({
        // needs to be a string because it is getting passed
        // to the dom
        immovable: column.immovable ? "true" : "false",
        columnindex: column.columnIndex
      })
    };
    const noEllipsis = column.noEllipsis;
    if (column.width) {
      tableColumn.width = column.width;
    }
    if (cellRenderer && cellRenderer[column.path]) {
      tableColumn.Cell = row => {
        const val = cellRenderer[column.path](row.value, row.original, row, {
          currentParams,
          setNewParams
        });
        return val;
      };
    } else if (column.render) {
      tableColumn.Cell = row => {
        const val = column.render(row.value, row.original, row, {
          recordIdToIsVisibleMap,
          setRecordIdToIsVisibleMap,
          currentParams,
          setNewParams
        });
        return val;
      };
    } else if (column.type === "timestamp") {
      tableColumn.Cell = ({ value }) => {
        return value ? dayjs(value).format("lll") : "";
      };
    } else if (column.type === "color") {
      tableColumn.Cell = ({ value }) => {
        return value ? (
          <div
            style={{
              height: 20,
              width: 40,
              background: value,
              border: "1px solid #182026",
              borderRadius: 5
            }}
          />
        ) : (
          ""
        );
      };
    } else if (column.type === "boolean") {
      if (isCellEditable) {
        tableColumn.Cell = ({ value }) => (value ? "True" : "False");
      } else {
        tableColumn.Cell = ({ value }) => (
          <Icon
            className={classNames({
              [Classes.TEXT_MUTED]: !value
            })}
            icon={value ? "tick" : "cross"}
          />
        );
      }
    } else if (column.type === "markdown") {
      tableColumn.Cell = ({ value }) => (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
      );
    } else {
      tableColumn.Cell = ({ value }) => value;
    }
    const oldFunc = tableColumn.Cell;

    tableColumn.Cell = (...args) => (
      <RenderCell
        oldFunc={oldFunc}
        formName={formName}
        getCopyTextForCell={getCopyTextForCell}
        column={column}
        isCellEditable={isCellEditable}
        isEntityDisabled={isEntityDisabled}
        finishCellEdit={finishCellEdit}
        noEllipsis={noEllipsis}
        editingCell={editingCell}
        cancelCellEdit={cancelCellEdit}
        editingCellSelectAll={editingCellSelectAll}
        getCellHoverText={getCellHoverText}
        selectedCells={selectedCells}
        isSelectionARectangle={isSelectionARectangle}
        startCellEdit={startCellEdit}
        tableRef={tableRef}
        onDragEnd={onDragEnd}
        args={args}
      />
    );
    return tableColumn;
  });

  return columnsToRender.concat(tableColumns);
};
