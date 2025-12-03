import React, { useState } from "react";
import { Icon } from "@blueprintjs/core";

export default function AdvancedOptions({
  children,
  content,
  label,
  style,
  isOpenByDefault,
  localStorageKey
}) {
  const [isOpen, setOpen] = useState(() => {
    if (localStorageKey) {
      if (window.localStorage.getItem(localStorageKey) === "true") {
        return true;
      } else if (window.localStorage.getItem(localStorageKey) === "false") {
        return false;
      }
    }
    return isOpenByDefault;
  });
  if (!(content || children)) {
    return null;
  }
  return (
    <div style={{ marginTop: 5, ...style }}>
      <div
        onClick={() => {
          const newIsOpen = !isOpen;
          setOpen(newIsOpen);
          if (localStorageKey) {
            window.localStorage.setItem(localStorageKey, newIsOpen);
          }
        }}
        style={{ cursor: "pointer", display: "flex", alignItems: "flex-end" }}
        className="tg-toggle-advanced-options"
      >
        {label || "Advanced"}{" "}
        <Icon
          icon={isOpen ? "caret-down" : "caret-right"}
          style={{ marginLeft: 5 }}
        ></Icon>
      </div>
      {isOpen && <div style={{ marginTop: 10 }}>{content || children}</div>}
    </div>
  );
}
