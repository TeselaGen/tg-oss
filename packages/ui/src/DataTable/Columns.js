import React, { isValidElement } from "react";
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
  isBottomRightCornerOfRectangle,
  PRIMARY_SELECTED_VAL,
  stripNumberAtEnd
} from "./utils";
import FilterAndSortMenu from "./FilterAndSortMenu";
import { ColumnFilterMenu } from "./ColumnFilterMenu";
import getTextFromEl from "../utils/getTextFromEl";
import rowClick, { finalizeSelection } from "./utils/rowClick";
import { editCellHelper } from "./editCellHelper";
import { DropdownCell } from "./DropdownCell";
import { EditableCell } from "./EditabelCell";
import { getVals } from "./getVals";
import { CellDragHandle } from "./CellDragHandle";
import { getCellVal } from "./getCellVal";

dayjs.extend(localizedFormat);

const renderColumnHeader = ({
  addFilters,
  column,
  compact,
  currentParams,
  entities,
  extraCompact,
  filters,
  isCellEditable,
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
    path
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
  const ccDisplayName = camelCase(displayName || path);
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
      if (orderField === ccDisplayName) {
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
  const sortComponent =
    withSort && !disableSorting ? (
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
    ) : null;
  const FilterMenu = column.FilterMenu || FilterAndSortMenu;

  const filterMenu =
    withFilter && !disableFiltering ? (
      <ColumnFilterMenu
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
    ) : null;
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
        {sortComponent}
        {filterMenu}
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

const RenderCell = ({
  oldFunc,
  getCopyTextForCell,
  column,
  isCellEditable,
  isEntityDisabled,
  finishCellEdit,
  noEllipsis,
  editingCell,
  cancelCellEdit,
  editableCellValue,
  setEditableCellValue,
  getCellHoverText,
  selectedCells,
  isSelectionARectangle,
  startCellEdit,
  tableRef,
  onDragEnd,
  args
}) => {
  const [row] = args;
  const rowId = getIdOrCodeOrIndex(row.original, row.index);
  const cellId = `${rowId}:${row.column.path}`;
  let val = oldFunc(...args);
  const oldVal = val;
  const text = getCopyTextForCell(val, row, column);
  const isBool = column.type === "boolean";
  const dataTest = {
    "data-test": "tgCell_" + column.path
  };
  const fullValue = row.original?.[row.column.path];
  if (isCellEditable && isBool) {
    val = (
      <Checkbox
        disabled={isEntityDisabled(row.original)}
        className="tg-cell-edit-boolean-checkbox"
        checked={oldVal === "True"}
        onChange={e => {
          const checked = e.target.checked;
          finishCellEdit(cellId, checked);
        }}
      />
    );
    noEllipsis = true;
  } else if (editingCell === cellId) {
    if (column.type === "genericSelect") {
      const GenericSelectComp = column.GenericSelectComp;

      return (
        <GenericSelectComp
          rowId={rowId}
          fullValue={fullValue}
          initialValue={text}
          {...dataTest}
          finishEdit={(newVal, doNotStopEditing) => {
            finishCellEdit(cellId, newVal, doNotStopEditing);
          }}
          dataTest={dataTest}
          cancelEdit={cancelCellEdit}
        />
      );
    }
    if (column.type === "dropdown" || column.type === "dropdownMulti") {
      return (
        <DropdownCell
          isMulti={dataTest.isMulti || column.type === "dropdownMulti"}
          initialValue={dataTest.initialValue || text}
          options={getVals(column.values)}
          finishEdit={(newVal, doNotStopEditing) => {
            finishCellEdit(cellId, newVal, doNotStopEditing);
          }}
          dataTest={dataTest}
          cancelEdit={cancelCellEdit}
        />
      );
    } else {
      return (
        <EditableCell
          value={editableCellValue}
          setValue={setEditableCellValue}
          dataTest={dataTest}
          cancelEdit={cancelCellEdit}
          isNumeric={column.type === "number"}
          initialValue={text}
          finishEdit={newVal => {
            finishCellEdit(cellId, newVal);
          }}
        />
      );
    }
  }

  //wrap the original tableColumn.Cell function in another div in order to add a title attribute
  let title = text;
  if (getCellHoverText) title = getCellHoverText(...args);
  else if (column.getTitleAttr) title = column.getTitleAttr(...args);
  const isSelectedCell = selectedCells?.[cellId];
  const {
    isRect,
    selectionGrid,
    lastRowIndex,
    lastCellIndex,
    entityMap,
    pathToIndex
  } = isSelectionARectangle();

  return (
    <>
      <div
        style={{
          ...(!noEllipsis && {
            textOverflow: "ellipsis",
            overflow: "hidden"
          })
        }}
        {...dataTest}
        className="tg-cell-wrapper"
        data-copy-text={text}
        data-copy-json={JSON.stringify(
          //tnw: eventually we'll parse these back out and use either the fullValue (for the generic selects) or the regular text vals for everything else
          column.type === "genericSelect"
            ? {
                __strVal: fullValue,
                __genSelCol: column.path
              }
            : { __strVal: text }
        )}
        title={title || undefined}
      >
        {val}
      </div>
      {isCellEditable &&
        (column.type === "dropdown" ||
          column.type === "dropdownMulti" ||
          column.type === "genericSelect") && (
          <Icon
            icon="caret-down"
            style={{
              position: "absolute",
              right: 5,
              opacity: 0.3
            }}
            className="cell-edit-dropdown"
            onClick={() => {
              startCellEdit(cellId);
            }}
          />
        )}

      {isSelectedCell &&
        (isRect
          ? isBottomRightCornerOfRectangle({
              cellId,
              selectionGrid,
              lastRowIndex,
              lastCellIndex,
              entityMap,
              pathToIndex
            })
          : isSelectedCell === PRIMARY_SELECTED_VAL) && (
          <CellDragHandle
            key={cellId}
            thisTable={tableRef.current.tableRef}
            cellId={cellId}
            isSelectionARectangle={isSelectionARectangle}
            onDragEnd={onDragEnd}
          />
        )}
    </>
  );
};

export const renderColumns = props => {
  const {
    addFilters,
    cellRenderer,
    change,
    columns,
    currentParams,
    compact,
    editableCellValue,
    editingCell,
    editingCellSelectAll,
    entities,
    expandedEntityIdMap,
    extraCompact,
    filters,
    getCellHoverText,
    isCellEditable,
    isEntityDisabled,
    isLocalCall,
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
    setEditableCellValue,
    setEditingCell,
    setExpandedEntityIdMap,
    setNewParams,
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
    withFilter = !props.isSimple,
    withSort = true
  } = props;

  const onDragEnd = cellsToSelect => {
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
  };

  const getCopyTextForCell = (val, row = {}, column = {}) => {
    // TODOCOPY we need a way to potentially omit certain columns from being added as a \t element (talk to taoh about this)
    let text = typeof val !== "string" ? row.value : val;

    const record = row.original;
    if (column.getClipboardData) {
      text = column.getClipboardData(row.value, record, row, props);
    } else if (column.getValueToFilterOn) {
      text = column.getValueToFilterOn(record, props);
    } else if (column.render) {
      text = column.render(row.value, record, row, props);
    } else if (cellRenderer && cellRenderer[column.path]) {
      text = cellRenderer[column.path](row.value, row.original, row, props);
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
  };

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

  const renderCheckboxCell = row => {
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
  };

  const finishCellEdit = (cellId, newVal, doNotStopEditing) => {
    const [rowId, path] = cellId.split(":");
    !doNotStopEditing && setEditingCell(null);
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
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
    refocusTable();
  };

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

  columns.forEach(column => {
    const tableColumn = {
      ...column,
      Header: renderColumnHeader({
        column,
        isLocalCall,
        filters,
        currentParams,
        order,
        setOrder,
        withSort,
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
        const val = cellRenderer[column.path](
          row.value,
          row.original,
          row,
          props
        );
        return val;
      };
    } else if (column.render) {
      tableColumn.Cell = row => {
        const val = column.render(row.value, row.original, row, props);
        return val;
      };
    } else if (column.type === "timestamp") {
      tableColumn.Cell = props => {
        return props.value ? dayjs(props.value).format("lll") : "";
      };
    } else if (column.type === "color") {
      tableColumn.Cell = props => {
        return props.value ? (
          <div
            style={{
              height: 20,
              width: 40,
              background: props.value,
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
        tableColumn.Cell = props => (props.value ? "True" : "False");
      } else {
        tableColumn.Cell = props => (
          <Icon
            className={classNames({
              [Classes.TEXT_MUTED]: !props.value
            })}
            icon={props.value ? "tick" : "cross"}
          />
        );
      }
    } else if (column.type === "markdown") {
      tableColumn.Cell = props => (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{props.value}</ReactMarkdown>
      );
    } else {
      tableColumn.Cell = props => props.value;
    }
    const oldFunc = tableColumn.Cell;

    tableColumn.Cell = (...args) => (
      <RenderCell
        oldFunc={oldFunc}
        getCopyTextForCell={getCopyTextForCell}
        column={column}
        isCellEditable={isCellEditable}
        isEntityDisabled={isEntityDisabled}
        finishCellEdit={finishCellEdit}
        noEllipsis={noEllipsis}
        editingCell={editingCell}
        cancelCellEdit={cancelCellEdit}
        editableCellValue={editableCellValue}
        setEditableCellValue={setEditableCellValue}
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
    columnsToRender.push(tableColumn);
  });
  return columnsToRender;
};
