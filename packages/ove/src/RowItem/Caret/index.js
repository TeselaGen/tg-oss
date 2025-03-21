import React from "react";
import classnames from "classnames";
// import pure from "../../utils/pureNoFunc";
import "./style.css";
import { getSelectionMessage } from "../../utils/editorUtils";
// import draggableClassnames from "../../constants/draggableClassnames";

function Caret({
  charWidth,
  row,
  sequenceLength,
  caretPosition,
  isProtein,
  onClick,
  isDraggable,
  leftMargin = 0,
  onRightClick,
  style,
  selectionMessage,
  className = ""
}) {
  if (
    (row.start <= caretPosition && row.end + 1 >= caretPosition) ||
    (row.end === sequenceLength - 1 && row.end < caretPosition)
  ) {
    //the second logical operator catches the special case where we're at the very end of the sequence..
    const cursorEl = (
      <div
        onClick={onClick}
        onContextMenu={
          onRightClick
            ? e => {
                onRightClick(e);
              }
            : undefined
        }
        title={
          selectionMessage ||
          getSelectionMessage({ caretPosition, isProtein, sequenceLength })
        }
        className={classnames(
          {
            notClickable: !isDraggable
          },
          "veCaret",
          "veRowViewCaret",
          className
        )}
        style={{
          left: leftMargin + (caretPosition - row.start) * charWidth - 2,
          ...style
        }}
      />
    );
    return cursorEl;
  } else {
    return null;
  }
}

export default Caret;
// export default pure(Caret);
