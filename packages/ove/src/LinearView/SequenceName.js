import React from "react";

export function SequenceName({
  sequenceName,
  sequenceLength,
  isProtein,
  showAminoAcidUnitAsCodon
}) {
  const proteinUnits = showAminoAcidUnitAsCodon ? "codons" : "AAs";
  return (
    <div key="sequenceNameText" className="sequenceNameText">
      <span title={sequenceName}>{sequenceName} </span>
      <br />
      <span>
        {isProtein
          ? `${Math.floor(sequenceLength / 3)} ${proteinUnits}`
          : `${sequenceLength} bps`}
      </span>
    </div>
  );
}
