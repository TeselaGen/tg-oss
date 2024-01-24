/* eslint react/jsx-no-bind: 0 */
import { Popover } from "@blueprintjs/core";
import React, { useState } from "react";

export default function ExcelCell() {
  const [v, setV] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <Popover
      onClose={() => {
        setIsPopoverOpen(false);
      }}
      isOpen={isPopoverOpen}
      content={<div>Sum</div>}
    >
      <div
        style={{
          border: "1px solid #ccc",
          padding: 5,
          width: 100,
          height: 30
        }}
        contentEditable
        onInput={e => {
          const text = e.currentTarget.textContent;

          if (text === "=") {
            // open a popover
            setIsPopoverOpen(true);
          }
          setV(text);
        }}
      >
        {v}
      </div>
    </Popover>
  );
}
