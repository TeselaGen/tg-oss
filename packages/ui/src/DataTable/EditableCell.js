import React, { useEffect, useRef, useState } from "react";

const style = {
  border: 0,
  width: "95%",
  fontSize: 12,
  background: "none"
};

export const EditableCell = ({
  cancelEdit,
  dataTest,
  finishEdit,
  isNumeric,
  initialValue
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isNumeric]);

  return (
    <input
      style={style}
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
      onChange={e => {
        console.log("AQUII 2");
        if (isFirst.current) {
          isFirst.current = false;
          return;
        }
        setValue(e.target.value);
      }}
      type={isNumeric ? "number" : undefined}
      value={value}
    />
  );
};
