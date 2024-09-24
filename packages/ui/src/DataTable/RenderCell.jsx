import React from "react";
import { useSelector } from "react-redux";
import { Checkbox, Icon } from "@blueprintjs/core";
import {
  getIdOrCodeOrIndex,
  isBottomRightCornerOfRectangle,
  PRIMARY_SELECTED_VAL
} from "./utils";
import { DropdownCell } from "./DropdownCell";
import { EditableCell } from "./EditabelCell";
import { getVals } from "./getVals";
import { CellDragHandle } from "./CellDragHandle";

export const RenderCell = ({
  oldFunc,
  getCopyTextForCell,
  column,
  isCellEditable,
  isEntityDisabled,
  finishCellEdit,
  formName,
  noEllipsis,
  cancelCellEdit,
  getCellHoverText,
  selectedCells,
  isSelectionARectangle,
  startCellEdit,
  tableRef,
  onDragEnd,
  args
}) => {
  const editingCell = useSelector(
    state => state.form?.[formName]?.values?.reduxFormEditingCell
  );
  const initialValue = useSelector(
    state => state.form?.[formName]?.values?.reduxFormInitialValue
  );

  const [row] = args;
  const rowId = getIdOrCodeOrIndex(row.original, row.index);
  const cellId = `${rowId}:${row.column.path}`;
  const isEditingCell = editingCell === cellId;
  let val = oldFunc(...args);
  const oldVal = val;
  const text = getCopyTextForCell(val, row, column);
  const dataTest = {
    "data-test": "tgCell_" + column.path
  };
  const fullValue = row.original?.[row.column.path];

  if (isEditingCell) {
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
          dataTest={dataTest}
          cancelEdit={cancelCellEdit}
          isNumeric={column.type === "number"}
          initialValue={initialValue || text}
          finishEdit={newVal => {
            finishCellEdit(cellId, newVal);
          }}
        />
      );
    }
  }

  const isBool = column.type === "boolean";
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
