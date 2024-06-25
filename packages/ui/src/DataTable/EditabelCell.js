import React, { useState } from "react";

export const EditableCell = ({
  shouldSelectAll,
  stopSelectAll,
  initialValue,
  finishEdit,
  cancelEdit,
  isNumeric,
  dataTest
}) => {
  const [v, setV] = useState(initialValue);
  return (
    <input
      style={{
        border: 0,
        width: "95%",
        fontSize: 12,
        background: "none"
      }}
      ref={r => {
        if (shouldSelectAll && r) {
          r?.select();
          stopSelectAll();
        }
      }}
      {...dataTest}
      type={isNumeric ? "number" : undefined}
      value={v}
      autoFocus
      onKeyDown={e => {
        if (e.key === "Enter") {
          finishEdit(v);
          e.stopPropagation();
        } else if (e.key === "Escape") {
          e.stopPropagation();
          cancelEdit();
        }
      }}
      onBlur={() => {
        finishEdit(v);
      }}
      onChange={e => {
        setV(e.target.value);
      }}
    />
  );
};
