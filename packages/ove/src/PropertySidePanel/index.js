import React, { useCallback, useEffect, useMemo } from "react";
import { Button } from "@blueprintjs/core";
import "./style.css";
import {
  calculateAminoAcidFrequency,
  aminoAcidShortNames
} from "./calculateAminoAcidFrequency";

export default ({ properties, setProperties, style }) => {
  const sidebarRef = React.useRef(null);
  const [mismatchesCount, setMismatchesCount] = React.useState(0);
  const [mismatchesInRange, setMismatchesInRange] = React.useState(0);

  const { track, isOpen, selection, isPairwise } = properties;

  const getSequenceInRegion = useCallback(() => {
    const seq = track?.alignmentData?.sequence ?? "";
    if (!selection || selection.start == -1 || selection.end == -1) {
      return seq;
    }

    const start = Math.max(0, selection.start);
    const end = Math.min(seq.length - 1, selection.end);
    if (start > end) return "";
    return seq.slice(start, end + 1);
  }, [track, selection]);

  const mismatchKey = isPairwise ? "additionalSelectionLayers" : "mismatches";

  const trackMismatches = useMemo(() => {
    const tr = track?.[mismatchKey];
    if (!Array.isArray(tr)) return [];
    return isPairwise ? tr.filter(m => m?.color === "red") : tr;
  }, [track, mismatchKey, isPairwise]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    sidebarRef.current.focus();

    if (selection && selection.start > -1 && selection.end > -1) {
      let count = 0;

      trackMismatches?.forEach(tm => {
        if (tm == null || tm.start == null || tm.end == null) {
          return;
        }

        let overlapStart = Math.max(tm.start, selection.start);
        let overlapEnd = Math.min(tm.end, selection.end);
        if (overlapEnd >= overlapStart) {
          count += overlapEnd - overlapStart + 1;
        }
      });
      setMismatchesInRange(count);
    } else {
      let count = 0;
      trackMismatches?.forEach(tm => {
        if (tm == null || tm.start == null || tm.end == null) {
          return;
        }

        let overlapStart = tm.start;
        let overlapEnd = tm.end;
        if (overlapEnd >= overlapStart) {
          count += overlapEnd - overlapStart + 1;
        }
      });

      setMismatchesCount(count);
      setMismatchesInRange(count);
    }
  }, [isOpen, track, selection]);

  let aminoFreq = useMemo(() => {
    const seq = getSequenceInRegion();
    return calculateAminoAcidFrequency(seq ?? "");
  }, [getSequenceInRegion]);

  if (!isOpen || !track) {
    return null;
  }

  const aaEntries = Object.entries(aminoFreq.frequencies);

  return (
    <div
      ref={sidebarRef}
      style={{
        width: isOpen ? 350 : 0,
        minWidth: isOpen ? 350 : 0,
        maxWidth: isOpen ? 350 : 0,
        paddingLeft: 20,
        paddingRight: 20,
        ...style
      }}
      className="sidebar-container"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Escape") {
          setProperties({ isOpen: false, track: null });
        }
      }}
    >
      <div
        style={{
          display: "flex",
          padding: 4,
          paddingTop: 11,
          paddingBottom: 11,
          width: "100%"
        }}
      >
        <Button
          style={{ height: "fit-content" }}
          onClick={() => {
            setProperties({ isOpen: false, track: null });
          }}
          minimal
          text={"Hide Properties"}
          intent="primary"
          icon="chevron-right"
        ></Button>
      </div>
      <h5>Properties</h5>
      <div className="bp3-tab-panel">
        <div className="ve-flex-row property-name">
          <div className="ve-column-left">Name</div>
          <div className="ve-column-right">{track.sequenceData.name}</div>
        </div>
        <div className="ve-flex-row property-length">
          <div className="ve-column-left">Length</div>
          <div className="ve-column-right">
            {track.sequenceData.proteinSize}
          </div>
        </div>
        {track.sequenceData.name !== "Consensus" && (
          <>
            <div className="ve-flex-row property-molecular-weight">
              <div className="ve-column-left">Molecular Weight</div>
              <div className="ve-column-right">
                {track.sequenceData.molecularWeight?.toFixed(2)} Da
              </div>
            </div>
            <div className="ve-flex-row property-isoelectric-point">
              <div className="ve-column-left">Isoelectric Point</div>
              <div className="ve-column-right">
                {track.sequenceData?.isoPoint}
              </div>
            </div>
            <div className="ve-flex-row property-extinction-coefficient">
              <div className="ve-column-left">Extinction Coefficient</div>
              <div className="ve-column-right">
                {track.sequenceData.extinctionCoefficient}
              </div>
            </div>
          </>
        )}
        <div className="ve-flex-row property-mismatches">
          <div className="ve-column-left">Mismatches</div>
          <div className="ve-column-right">{`${mismatchesInRange}/${mismatchesCount}`}</div>
        </div>
        <div className="ve-flex-row property-region">
          <div className="ve-column-left">Region</div>
          <div className="ve-column-right">
            {selection && selection.start > -1 ? (
              <span>
                {selection.start + 1} - {selection.end + 1}
              </span>
            ) : (
              <span>1 - {track.sequenceData.proteinSize}</span>
            )}
          </div>
        </div>
      </div>
      <h5>Amino Acid Frequencies</h5>
      <div className="sidebar-table">
        <div className="sidebar-row">
          <div className="sidebar-cell">Amino Acid</div>
          <div className="sidebar-cell">Count</div>
          <div className="sidebar-cell">Percentage</div>
        </div>
        {aaEntries.map(([aa, data], idx) => {
          return (
            <div className={`sidebar-row property-amino-acid-${idx}`}>
              <div className="sidebar-cell">
                {aa} ({aminoAcidShortNames[aa]})
              </div>
              <div className="sidebar-cell">{data.count}</div>
              <div className="sidebar-cell">{data.percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
