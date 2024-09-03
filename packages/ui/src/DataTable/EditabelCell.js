import React, { useEffect, useRef } from "react";

export const EditableCell = ({
  value,
  setValue,
  cancelEdit,
  dataTest,
  finishEdit,
  isNumeric
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isNumeric]);

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
        e.stopPropagation();
        if (e.key === "Enter") {
          e.target.blur();
        } else if (e.key === "Escape") {
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
