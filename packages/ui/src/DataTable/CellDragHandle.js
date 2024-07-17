import { flatMap } from "lodash-es";
import { forEach } from "lodash-es";
import React, { useCallback, useRef } from "react";

export const CellDragHandle = ({
  thisTable,
  onDragEnd,
  cellId,
  isSelectionARectangle
}) => {
  const xStart = useRef(0);
  const timeoutkey = useRef();
  const rowsToSelect = useRef();
  const rectangleCellPaths = useRef();

  const handleDrag = useCallback(
    e => {
      const table = thisTable.querySelector(".rt-table");
      const trs = table.querySelectorAll(`.rt-tr-group.with-row-data`);
      const [rowId, path] = cellId.split(":");
      const selectedTr = table.querySelector(
        `.rt-tr-group.with-row-data[data-test-id="${rowId}"]`
      );
      if (!selectedTr) return;
      const selectedIndex = selectedTr.dataset.index;

      if (selectedTr && trs.length) {
        const selectedY = selectedTr.getBoundingClientRect().y;
        const cursorY = e.clientY;
        clearTimeout(timeoutkey.current);
        const updateScrollIfNecessary = () => {
          const { y, height } = table.getBoundingClientRect();
          if (cursorY < y) {
            table.scrollBy(0, -5);
          } else if (cursorY > y + height) {
            table.scrollBy(0, 5);
          }
        };
        updateScrollIfNecessary();
        timeoutkey.current = setInterval(() => {
          updateScrollIfNecessary();
        }, 10);

        const isCursorBelow = cursorY > selectedY;
        rowsToSelect.current = [];
        forEach(trs, (tr, index) => {
          let isSelectedForUpdate;
          const rowId = tr.dataset.testId;
          const changeDashedBorder = (path, on) => {
            tr.querySelector(
              `[data-test="tgCell_${path}"]`
            ).parentNode.classList[on ? "add" : "remove"]("selectedForUpdate");
          };
          if (isCursorBelow ? index > selectedIndex : index < selectedIndex) {
            const { y, height } = tr.getBoundingClientRect();
            if (isCursorBelow ? y < cursorY : y + height > cursorY) {
              rowsToSelect.current.push(rowId);
              isSelectedForUpdate = true;
              //add dashed borders

              if (rectangleCellPaths.current) {
                rectangleCellPaths.current.forEach(path => {
                  changeDashedBorder(path, true);
                });
              } else {
                changeDashedBorder(path, true);
              }
            }
          }
          if (!isSelectedForUpdate) {
            if (rectangleCellPaths.current) {
              rectangleCellPaths.current.forEach(path => {
                changeDashedBorder(path, false);
              });
            } else {
              changeDashedBorder(path, false);
            }
          }
        });
      }
    },
    [cellId, thisTable]
  );

  const onMouseUp = useCallback(() => {
    clearTimeout(timeoutkey.current);
    const table = thisTable;
    const trs = table.querySelectorAll(`.rt-tr-group.with-row-data`);
    const [, path] = cellId.split(":");
    //remove the dashed borders
    forEach(trs, tr => {
      if (rectangleCellPaths.current) {
        rectangleCellPaths.current.forEach(path => {
          const el = tr.querySelector(`[data-test="tgCell_${path}"]`);
          el.parentNode.classList.remove("selectedForUpdate");
        });
      } else {
        const el = tr.querySelector(`[data-test="tgCell_${path}"]`);
        el.parentNode.classList.remove("selectedForUpdate");
      }
    });
    document.removeEventListener("mousemove", handleDrag, false);
    document.removeEventListener("mouseup", onMouseUp, false);
    onDragEnd(
      flatMap(rowsToSelect.current, id => {
        if (rectangleCellPaths.current) {
          return rectangleCellPaths.current.map(path => {
            return `${id}:${path}`;
          });
        } else {
          return `${id}:${path}`;
        }
      })
    );
  }, [cellId, handleDrag, onDragEnd, thisTable]);

  return (
    <div
      onMouseDown={e => {
        rowsToSelect.current = [];
        xStart.current = e.clientX;
        const { isRect, selectedPaths } = isSelectionARectangle();
        if (isRect) {
          rectangleCellPaths.current = selectedPaths;
        }
        document.addEventListener("mousemove", handleDrag, false);
        document.addEventListener("mouseup", onMouseUp, false);
      }}
      className="cellDragHandle"
    />
  );
};
