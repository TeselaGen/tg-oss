import React, { useCallback, useMemo } from "react";
import Table from "@teselagen/react-table";
import { cloneDeep, keyBy, forEach, omitBy } from "lodash-es";
import classNames from "classnames";
import { useColumns } from "./Columns";
import { arrayMove } from "@dnd-kit/sortable";
import SortableColumns from "./SortableColumns";
import {
  getCellCopyText,
  getCellInfo,
  getIdOrCodeOrIndex,
  getRecordsFromIdMap,
  handleCopyColumn,
  handleCopyHelper,
  handleCopyRows,
  handleCopyTable,
  isEntityClean,
  PRIMARY_SELECTED_VAL
} from "./utils";
import { Menu, MenuItem, ContextMenu } from "@blueprintjs/core";
import rowClick, { finalizeSelection } from "./utils/rowClick";
import { ThComponent } from "./ThComponent";
import DisabledLoadingComponent from "./DisabledLoadingComponent";
import "./style.css";

const itemSizeEstimators = {
  compact: () => 25.34,
  normal: () => 33.34,
  comfortable: () => 41.34
};

export const ReactTable = ({
  addFilters,
  cellRenderer,
  change,
  columns,
  compact,
  contextMenu,
  currentParams,
  disabled,
  doNotShowEmptyRows,
  doNotValidateUntouchedRows,
  editingCellSelectAll,
  entities,
  expandedEntityIdMap,
  extraCompact,
  filters,
  formName,
  getCellHoverText,
  getRowClassName,
  handleCellClick,
  handleCopySelectedRows,
  history,
  insertRows,
  isCellEditable,
  isCopyable,
  isEntityDisabled,
  isLoading,
  isLocalCall,
  isSelectionARectangle,
  isSimple,
  isSingleSelect,
  maxHeight,
  moveColumnPersist,
  mustClickCheckboxToSelect,
  noDeselectAll,
  noRowsFoundMessage,
  noSelect,
  noUserSelect,
  noVirtual,
  numRows,
  onDeselect,
  onDoubleClick,
  onlyShowRowsWErrors,
  onMultiRowSelect,
  onRowClick,
  onRowSelect,
  onSingleRowSelect,
  order,
  primarySelectedCellId,
  ReactTableProps,
  recordIdToIsVisibleMap,
  reduxFormCellValidation,
  reduxFormEditingCell,
  reduxFormSelectedEntityIdMap,
  refocusTable,
  removeSingleFilter,
  resizePersist,
  schema,
  selectedCells,
  setColumns,
  setExpandedEntityIdMap,
  setNewParams,
  setOrder,
  setRecordIdToIsVisibleMap,
  setSelectedCells,
  shouldShowSubComponent,
  startCellEdit,
  style,
  SubComponent,
  tableConfig,
  tableRef,
  updateEntitiesHelper,
  updateValidation,
  withCheckboxes,
  withExpandAndCollapseAllButton,
  withFilter,
  withSort
}) => {
  let rowsToShow = doNotShowEmptyRows
    ? Math.min(numRows, entities.length)
    : numRows;
  // if there are no entities then provide enough space to show
  // no rows found message
  if (entities.length === 0 && rowsToShow < 3) rowsToShow = 3;

  const showContextMenu = useCallback(
    (e, { idMap, selectedCells } = {}) => {
      let selectedRecords;
      if (isCellEditable) {
        const rowIds = {};
        Object.keys(selectedCells).forEach(cellKey => {
          const [rowId] = cellKey.split(":");
          rowIds[rowId] = true;
        });
        selectedRecords = entities.filter(
          ent => rowIds[getIdOrCodeOrIndex(ent)]
        );
      } else {
        selectedRecords = getRecordsFromIdMap(idMap);
      }

      const itemsToRender = contextMenu({
        selectedRecords,
        history
      });
      if (!itemsToRender && !isCopyable) return null;
      const copyMenuItems = [];

      e.persist();
      if (isCopyable) {
        //compute the cellWrapper here so we don't lose access to it
        const cellWrapper =
          e.target.querySelector(".tg-cell-wrapper") ||
          e.target.closest(".tg-cell-wrapper");
        if (cellWrapper) {
          copyMenuItems.push(
            <MenuItem
              key="copyCell"
              onClick={() => {
                //TODOCOPY: we need to make sure that the cell copy is being used by the row copy.. right now we have 2 different things going on
                //do we need to be able to copy hidden cells? It seems like it should just copy what's on the page..?
                const specificColumn = cellWrapper.getAttribute("data-test");
                handleCopyRows([cellWrapper.closest(".rt-tr")], {
                  specificColumn,
                  onFinishMsg: "Cell copied"
                });
                const [text, jsonText] = getCellCopyText(cellWrapper);
                handleCopyHelper(text, jsonText);
              }}
              text="Cell"
            />
          );

          copyMenuItems.push(
            <MenuItem
              key="copyColumn"
              onClick={() => {
                handleCopyColumn(tableRef, cellWrapper);
              }}
              text="Column"
            />
          );
          if (selectedRecords.length > 1) {
            copyMenuItems.push(
              <MenuItem
                key="copyColumnSelected"
                onClick={() => {
                  handleCopyColumn(tableRef, cellWrapper, selectedRecords);
                }}
                text="Column (Selected)"
              />
            );
          }
        }
        if (selectedRecords.length === 0 || selectedRecords.length === 1) {
          //compute the row here so we don't lose access to it
          const cell =
            e.target.querySelector(".tg-cell-wrapper") ||
            e.target.closest(".tg-cell-wrapper") ||
            e.target.closest(".rt-td");
          const row = cell.closest(".rt-tr");
          copyMenuItems.push(
            <MenuItem
              key="copySelectedRows"
              onClick={() => {
                handleCopyRows([row]);
                // loop through each cell in the row
              }}
              text="Row"
            />
          );
        } else if (selectedRecords.length > 1) {
          copyMenuItems.push(
            <MenuItem
              key="copySelectedRows"
              onClick={() => {
                handleCopySelectedRows(selectedRecords, e);
                // loop through each cell in the row
              }}
              text="Rows"
            />
          );
        }
        copyMenuItems.push(
          <MenuItem
            key="copyFullTableRows"
            onClick={() => {
              handleCopyTable(tableRef);
              // loop through each cell in the row
            }}
            text="Table"
          />
        );
      }
      const selectedRowIds = Object.keys(selectedCells).map(cellId => {
        const [rowId] = cellId.split(":");
        return rowId;
      });

      const menu = (
        <Menu>
          {itemsToRender}
          {copyMenuItems.length && (
            <MenuItem icon="clipboard" key="copyOpts" text="Copy">
              {copyMenuItems}
            </MenuItem>
          )}
          {isCellEditable && (
            <>
              <MenuItem
                icon="add-row-top"
                text="Add Row Above"
                key="addRowAbove"
                onClick={() => {
                  insertRows({ above: true });
                }}
              />
              <MenuItem
                icon="add-row-top"
                text="Add Row Below"
                key="addRowBelow"
                onClick={() => {
                  insertRows({});
                }}
              />
              <MenuItem
                icon="remove"
                text={`Remove Row${selectedRowIds.length > 1 ? "s" : ""}`}
                key="removeRow"
                onClick={() => {
                  const selectedRowIds = Object.keys(selectedCells).map(
                    cellId => {
                      const [rowId] = cellId.split(":");
                      return rowId;
                    }
                  );
                  updateEntitiesHelper(entities, entities => {
                    const ents = entities.filter(
                      (e, i) =>
                        !selectedRowIds.includes(getIdOrCodeOrIndex(e, i))
                    );
                    updateValidation(
                      ents,
                      omitBy(reduxFormCellValidation, (v, cellId) =>
                        selectedRowIds.includes(cellId.split(":")[0])
                      )
                    );
                    return ents;
                  });
                  refocusTable();
                }}
              />
            </>
          )}
        </Menu>
      );
      ContextMenu.show(menu, { left: e.clientX, top: e.clientY });
    },
    [
      contextMenu,
      entities,
      handleCopySelectedRows,
      history,
      insertRows,
      isCellEditable,
      isCopyable,
      reduxFormCellValidation,
      refocusTable,
      tableRef,
      updateEntitiesHelper,
      updateValidation
    ]
  );

  const getTableCellProps = useCallback(
    (state, rowInfo, column) => {
      if (!isCellEditable) return {}; //only allow cell selection to do stuff here
      if (!rowInfo) return {};
      if (!reduxFormCellValidation) return {};
      const entity = rowInfo.original;
      const rowIndex = rowInfo.index;
      const rowId = getIdOrCodeOrIndex(entity, rowIndex);
      const {
        cellId,
        cellIdAbove,
        cellIdToRight,
        cellIdBelow,
        cellIdToLeft,
        rowDisabled,
        columnIndex
      } = getCellInfo({
        columnIndex: column.index,
        columnPath: column.path,
        rowId,
        schema,
        entities,
        rowIndex,
        isEntityDisabled,
        entity
      });

      const _isClean =
        (entity._isClean && doNotValidateUntouchedRows) ||
        isEntityClean(entity);

      const err = !_isClean && reduxFormCellValidation[cellId];
      let selectedTopBorder,
        selectedRightBorder,
        selectedBottomBorder,
        selectedLeftBorder;
      if (selectedCells[cellId]) {
        selectedTopBorder = !selectedCells[cellIdAbove];
        selectedRightBorder = !selectedCells[cellIdToRight];
        selectedBottomBorder = !selectedCells[cellIdBelow];
        selectedLeftBorder = !selectedCells[cellIdToLeft];
      }
      const isPrimarySelected = selectedCells[cellId] === PRIMARY_SELECTED_VAL;
      const className = classNames({
        isSelectedCell: selectedCells[cellId],
        isPrimarySelected,
        isSecondarySelected: selectedCells[cellId] === true,
        noSelectedTopBorder: !selectedTopBorder,
        isCleanRow: _isClean,
        noSelectedRightBorder: !selectedRightBorder,
        noSelectedBottomBorder: !selectedBottomBorder,
        noSelectedLeftBorder: !selectedLeftBorder,
        isDropdownCell: column.type === "dropdown",
        isEditingCell: reduxFormEditingCell === cellId,
        hasCellError: !!err,
        "no-data-tip": selectedCells[cellId]
      });
      return {
        onDoubleClick: () => {
          // cell double click
          if (rowDisabled) return;
          startCellEdit(cellId);
        },
        ...(err && {
          "data-tip": err?.message || err,
          "data-no-child-data-tip": true
        }),
        onContextMenu: e => {
          const newSelectedCells = { ...selectedCells };
          if (!isPrimarySelected) {
            if (primarySelectedCellId) {
              newSelectedCells[primarySelectedCellId] = true;
            }
            newSelectedCells[cellId] = PRIMARY_SELECTED_VAL;
            setSelectedCells(newSelectedCells);
          }
          showContextMenu(e, { selectedCells: newSelectedCells });
        },
        onClick: event => {
          handleCellClick({
            event,
            cellId,
            rowDisabled,
            rowIndex,
            columnIndex
          });
        },
        className
      };
    },
    [
      doNotValidateUntouchedRows,
      entities,
      handleCellClick,
      isCellEditable,
      isEntityDisabled,
      primarySelectedCellId,
      reduxFormCellValidation,
      reduxFormEditingCell,
      schema,
      selectedCells,
      setSelectedCells,
      showContextMenu,
      startCellEdit
    ]
  );

  const getTableRowProps = useCallback(
    (state, rowInfo) => {
      if (!rowInfo) {
        return {
          className: "no-row-data"
        };
      }
      const entity = rowInfo.original;
      const rowId = getIdOrCodeOrIndex(entity, rowInfo.index);
      const rowSelected = reduxFormSelectedEntityIdMap[rowId];
      const isExpanded = expandedEntityIdMap[rowId];
      const rowDisabled = isEntityDisabled(entity);
      const dataId = entity.id || entity.code;
      return {
        onClick: e => {
          if (isCellEditable) return;
          // if checkboxes are activated or row expander is clicked don't select row
          if (e.target.matches(".tg-expander, .tg-expander *")) {
            setExpandedEntityIdMap(prev => ({ ...prev, [rowId]: !isExpanded }));
            return;
          } else if (
            e.target.closest(".tg-react-table-checkbox-cell-container")
          ) {
            return;
          } else if (mustClickCheckboxToSelect) {
            return;
          }
          if (e.detail > 1) {
            return; //cancel multiple quick clicks
          }
          rowClick(e, rowInfo, entities, {
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
        },
        //row right click
        onContextMenu: e => {
          e.preventDefault();
          if (rowId === undefined || rowDisabled || isCellEditable) return;
          const oldIdMap = cloneDeep(reduxFormSelectedEntityIdMap) || {};
          let newIdMap;
          if (withCheckboxes) {
            newIdMap = oldIdMap;
          } else {
            // if we are not using checkboxes we need to make sure
            // that the id of the record gets added to the id map
            newIdMap = oldIdMap[rowId] ? oldIdMap : { [rowId]: { entity } };

            // tgreen: this will refresh the selection with fresh data. The entities in redux might not be up to date
            const keyedEntities = keyBy(entities, getIdOrCodeOrIndex);
            forEach(newIdMap, (val, key) => {
              const freshEntity = keyedEntities[key];
              if (freshEntity) {
                newIdMap[key] = { ...newIdMap[key], entity: freshEntity };
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
          }
          showContextMenu(e, { idMap: newIdMap, selectedCells });
        },
        className: classNames(
          "with-row-data",
          getRowClassName && getRowClassName(rowInfo, state),
          {
            disabled: rowDisabled,
            selected: rowSelected && !withCheckboxes,
            "rt-tr-last-row": rowInfo.index === entities.length - 1
          }
        ),
        "data-test-id": dataId === undefined ? rowInfo.index : dataId,
        "data-index": rowInfo.index,
        "data-tip": typeof rowDisabled === "string" ? rowDisabled : undefined,
        onDoubleClick: e => {
          if (rowDisabled) return;
          onDoubleClick &&
            onDoubleClick(rowInfo.original, rowInfo.index, history, e);
        }
      };
    },
    [
      change,
      entities,
      expandedEntityIdMap,
      getRowClassName,
      history,
      isCellEditable,
      isEntityDisabled,
      isSingleSelect,
      mustClickCheckboxToSelect,
      noDeselectAll,
      noSelect,
      onDeselect,
      onDoubleClick,
      onMultiRowSelect,
      onRowClick,
      onRowSelect,
      onSingleRowSelect,
      reduxFormSelectedEntityIdMap,
      selectedCells,
      setExpandedEntityIdMap,
      showContextMenu,
      withCheckboxes
    ]
  );

  const TheadComponent = useCallback(
    ({ className, style, children }) => {
      const moveColumn = ({ oldIndex, newIndex }) => {
        let oldStateColumnIndex, newStateColumnIndex;
        columns.forEach((column, i) => {
          if (oldIndex === column.columnIndex) oldStateColumnIndex = i;
          if (newIndex === column.columnIndex) newStateColumnIndex = i;
        });
        // because it is all handled in state we need
        // to perform the move and update the columnIndices
        // because they are used for the sortable columns
        const newColumns = arrayMove(
          columns,
          oldStateColumnIndex,
          newStateColumnIndex
        ).map((column, i) => {
          return {
            ...column,
            columnIndex: i
          };
        });
        setColumns(newColumns);
      };
      return (
        <SortableColumns
          className={className}
          style={style}
          moveColumn={moveColumnPersist || moveColumn}
        >
          {children}
        </SortableColumns>
      );
    },
    [columns, moveColumnPersist, setColumns]
  );

  const expandedRows = entities.reduce((acc, row, index) => {
    const rowId = getIdOrCodeOrIndex(row, index);
    acc[index] = expandedEntityIdMap[rowId];
    return acc;
  }, {});

  const renderColumns = useColumns({
    addFilters,
    cellRenderer,
    columns,
    currentParams,
    compact,
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
    removeSingleFilter,
    schema,
    selectedCells,
    setExpandedEntityIdMap,
    setNewParams,
    setOrder,
    setSelectedCells,
    shouldShowSubComponent,
    startCellEdit,
    SubComponent,
    tableRef,
    updateEntitiesHelper,
    updateValidation,
    withCheckboxes,
    withExpandAndCollapseAllButton,
    withFilter,
    withSort,
    recordIdToIsVisibleMap,
    setRecordIdToIsVisibleMap
  });

  const filteredEnts = useMemo(() => {
    if (onlyShowRowsWErrors) {
      const rowToErrorMap = {};
      forEach(reduxFormCellValidation, (err, cellId) => {
        if (err) {
          const [rowId] = cellId.split(":");
          rowToErrorMap[rowId] = true;
        }
      });
      return entities.filter(e => {
        return rowToErrorMap[e.id];
      });
    }
    return entities;
  }, [entities, onlyShowRowsWErrors, reduxFormCellValidation]);

  const SubComponentToUse = useMemo(() => {
    if (SubComponent) {
      return row => {
        let shouldShow = true;
        if (shouldShowSubComponent) {
          shouldShow = shouldShowSubComponent(row.original);
        }
        if (shouldShow) {
          return SubComponent(row);
        }
      };
    }
    return;
  }, [SubComponent, shouldShowSubComponent]);

  const resized = useMemo(
    () => tableConfig.resized || [],
    [tableConfig?.resized]
  );

  return (
    <Table
      data={filteredEnts}
      ref={tableRef}
      noVirtual={noVirtual}
      className={classNames({
        isCellEditable,
        "tg-table-loading": isLoading,
        "tg-table-disabled": disabled
      })}
      itemSizeEstimator={
        extraCompact
          ? itemSizeEstimators.compact
          : compact
            ? itemSizeEstimators.normal
            : itemSizeEstimators.comfortable
      }
      TfootComponent={() => {
        return <button>hasdfasdf</button>;
      }}
      // We should try to not give all the props to the render column
      columns={renderColumns}
      pageSize={rowsToShow}
      expanded={expandedRows}
      showPagination={false}
      sortable={false}
      loading={isLoading || disabled}
      defaultResized={resized}
      onResizedChange={(newResized = []) => {
        const resizedToUse = newResized.map(column => {
          // have a min width of 50 so that columns don't disappear
          if (column.value < 50) {
            return {
              ...column,
              value: 50
            };
          } else {
            return column;
          }
        });
        resizePersist(resizedToUse);
      }}
      TheadComponent={TheadComponent}
      ThComponent={ThComponent}
      getTrGroupProps={getTableRowProps}
      getTdProps={getTableCellProps}
      NoDataComponent={({ children }) =>
        isLoading ? null : (
          <div className="rt-noData">{noRowsFoundMessage || children}</div>
        )
      }
      LoadingComponent={({ loadingText, loading }) => (
        <DisabledLoadingComponent
          loading={loading}
          loadingText={loadingText}
          disabled={disabled}
        />
      )}
      style={{
        maxHeight,
        minHeight: 150,
        ...style
      }}
      SubComponent={SubComponentToUse}
      {...ReactTableProps}
    />
  );
};
