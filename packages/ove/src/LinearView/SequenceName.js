import React from "react";

export function SequenceName({ sequenceName, sequenceLength, isProtein }) {
  const sequenceSize = isProtein
    ? Math.floor(sequenceLength / 3)
    : sequenceLength;
  return (
    <div key="sequenceNameText" className="sequenceNameText">
      <span>{sequenceName} </span>
      <br />
      <span>
        {isProtein
          ? `${sequenceSize} codon${sequenceSize > 1 ? "s" : ""}`
          : `${sequenceSize} bp${sequenceSize > 1 ? "s" : ""}`}
      </span>
    </div>
  );
}
