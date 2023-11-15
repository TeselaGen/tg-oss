import React from "react";

export function SequenceName({ sequenceName, sequenceLength, isProtein }) {
  return (
    <div key="sequenceNameText" className="sequenceNameText">
      <span>{sequenceName} </span>
      <br />
      <span>
        {isProtein
          ? `${Math.floor(sequenceLength / 3)} AAs`
          : `${sequenceLength} bps`}
      </span>
    </div>
  );
}
