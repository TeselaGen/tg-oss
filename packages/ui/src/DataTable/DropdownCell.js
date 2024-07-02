import React, { useState } from "react";
import classNames from "classnames";
import TgSelect from "../TgSelect";

export const DropdownCell = ({
  options,
  isMulti,
  initialValue,
  finishEdit,
  cancelEdit,
  dataTest
}) => {
  const [v, setV] = useState(
    isMulti
      ? initialValue.split(",").map(v => ({ value: v, label: v }))
      : initialValue
  );
  return (
    <div
      className={classNames("tg-dropdown-cell-edit-container", {
        "tg-dropdown-cell-edit-container-multi": isMulti
      })}
    >
      <TgSelect
        small
        multi={isMulti}
        autoOpen
        value={v}
        onChange={val => {
          if (isMulti) {
            setV(val);
            return;
          }
          finishEdit(val ? val.value : null);
        }}
        {...dataTest}
        popoverProps={{
          onClose: e => {
            if (isMulti) {
              if (e && e.key === "Escape") {
                cancelEdit();
              } else {
                finishEdit(
                  v && v.map
                    ? v
                        .map(v => v.value)
                        .filter(v => v)
                        .join(",")
                    : v
                );
              }
            } else {
              cancelEdit();
            }
          }
        }}
        options={options.map(value => ({ label: value, value }))}
      />
    </div>
  );
};
