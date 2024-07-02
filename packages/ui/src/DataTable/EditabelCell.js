import React, { useEffect, useRef, useState } from "react";

export const EditableCell = ({
  cancelEdit,
  dataTest,
  finishEdit,
  initialValue,
  isEditableCellInitialValue,
  isNumeric,
  shouldSelectAll,
  stopSelectAll
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (isEditableCellInitialValue && !isNumeric) {
        inputRef.current.selectionStart = inputRef.current.value.length;
        inputRef.current.selectionEnd = inputRef.current.value.length;
      } else if (shouldSelectAll) {
        inputRef.current.select();
        stopSelectAll();
      }
    }
  }, [isEditableCellInitialValue, isNumeric, shouldSelectAll, stopSelectAll]);

  return (
    <input
      style={{
        border: 0,
        width: "95%",
        fontSize: 12,
        background: "none"
      }}
      ref={inputRef}
      {...dataTest}
      autoFocus
      onKeyDown={e => {
        if (e.key === "Enter") {
          finishEdit(value);
          e.stopPropagation();
        } else if (e.key === "Escape") {
          e.stopPropagation();
          cancelEdit();
        }
      }}
      onBlur={() => finishEdit(value)}
      onChange={e => setValue(e.target.value)}
      type={isNumeric ? "number" : undefined}
      value={value}
    />
  );
};
