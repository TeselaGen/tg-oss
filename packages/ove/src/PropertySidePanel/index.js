import React, { useCallback, useEffect, useMemo } from "react";
import "./style.css";
import {
  calculateAminoAcidFrequency,
  aminoAcidShortNames
} from "./calculateAminoAcidFrequency";
import { Button } from "@blueprintjs/core";
import {
  scrollToAlignmentSelection,
  updateCaretPosition
} from "../AlignmentView/utils";
import { DataTable } from "@teselagen/ui";

export default ({ properties, setProperties, style }) => {
  const sidebarRef = React.useRef(null);
  const [mismatchesCount, setMismatchesCount] = React.useState(0);

  const { track, isOpen, selection, isPairwise } = properties;

  const getSequenceInRegion = useCallback(() => {
    const seq = track?.alignmentData?.sequence ?? "";
    if (!selection || selection.start === -1 || selection.end === -1) {
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

  const mismatchSchema = useMemo(
    () => ({
      fields: [
        {
          path: "start",
          type: "number",
          displayName: "Start",
          render: val => val + 1
        },
        {
          path: "end",
          type: "number",
          displayName: "End",
          render: val => val + 1
        }
      ]
    }),
    []
  );

  const mismatchEntities = useMemo(() => {
    return (trackMismatches || []).map((m, i) => ({
      ...m,
      id: i.toString()
    }));
  }, [trackMismatches]);

  useEffect(() => {
    if (!isOpen || sidebarRef.current === null || !track) {
      return;
    }

    sidebarRef.current.focus();
    let mismatchCount = 0;

    trackMismatches?.forEach(tm => {
      if (tm === null || tm.start === null || tm.end === null) {
        return;
      }

      const overlapStart = tm.start;
      const overlapEnd = tm.end;
      if (overlapEnd >= overlapStart) {
        mismatchCount += overlapEnd - overlapStart + 1;
      }
    });

    setMismatchesCount(mismatchCount);
  }, [isOpen, track, selection, trackMismatches]);

  const aminoFreq = useMemo(() => {
    const seq = getSequenceInRegion();
    return calculateAminoAcidFrequency(
      seq,
      track?.sequenceData?.isProtein ?? false
    );
  }, [getSequenceInRegion, track]);

  if (!isOpen) {
    return null;
  }
  let trackInner;

  if (track) {
    const {
      name,
      isProtein,
      proteinSize,
      size,
      molecularWeight,
      isoPoint,
      extinctionCoefficient
    } = track.sequenceData;

    const frequencyEntries = Object.entries(aminoFreq.frequencies);
    trackInner = (
      <>
        <div
          style={{
            display: "flex",
            padding: 4,
            paddingTop: 11,
            paddingBottom: 11,
            width: "100%"
          }}
        ></div>
        <HeaderItem title="Track Properties" />

        <div className="bp3-tab-panel">
          <RowItem item={name} title="Name" />
          <RowItem item={isProtein ? proteinSize : size} title="Length" />
          <RowItem
            item={molecularWeight?.toFixed(2)}
            title="Molecular Weight"
            units={isProtein ? "Da" : "g/mol"}
          />
          {name !== "Consensus" && isProtein && (
            <>
              <RowItem item={isoPoint} title="Isoelectric Point" />
              <RowItem
                item={extinctionCoefficient}
                title="Extinction Coefficient"
              />
            </>
          )}
          <RowItem
            item={
              selection && selection.start > -1 ? (
                <span>
                  {selection.start + 1} - {selection.end + 1}
                </span>
              ) : (
                <span>1 - {isProtein ? proteinSize : size}</span>
              )
            }
            title="Region"
          />
          <HeaderItem title={`Mismatches (${mismatchesCount})`} />

          {trackMismatches && trackMismatches.length > 0 && (
            <div
              style={{
                margin: "0px 10px"
              }}
            >
              <DataTable
                formName="mismatchesTable"
                isSimple
                noHeader
                noFooter
                withSearch={false}
                noPadding
                compact
                maxHeight={150}
                entities={mismatchEntities}
                schema={mismatchSchema}
                onRowClick={(e, row) => {
                  updateCaretPosition({ start: row.start, end: row.end });
                  setTimeout(() => {
                    scrollToAlignmentSelection();
                  }, 0);
                }}
              />
            </div>
          )}
        </div>
        <HeaderItem
          title={`${isProtein ? "Amino Acid" : "Base Pair"} Frequencies`}
        />
        <div className="sidebar-table">
          <div className="sidebar-row">
            <div className="sidebar-cell">
              {isProtein ? "Amino Acid" : "Base"}
            </div>
            <div className="sidebar-cell">Count</div>
            <div className="sidebar-cell">Percentage</div>
          </div>
          {frequencyEntries.map(([aa, data], idx) => {
            return (
              <div className={`sidebar-row property-amino-acid-${idx}`}>
                <div className="sidebar-cell">
                  {aa} {isProtein ? `(${aminoAcidShortNames[aa]})` : ""}
                </div>
                <div className="sidebar-cell">{data.count}</div>
                <div className="sidebar-cell">
                  {data.percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  } else {
    trackInner = (
      <div
        style={{
          marginTop: 20,
          fontStyle: "italic",
          fontSize: 16
        }}
      >
        Click on a track to view its properties
      </div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      style={{
        position: "relative",
        width: isOpen ? 350 : 0,
        minWidth: isOpen ? 350 : 0,
        maxWidth: isOpen ? 350 : 0,
        paddingLeft: 20,
        paddingRight: 20,
        ...style
      }}
      className="ove-sidebar-container"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Escape") {
          setProperties({ isOpen: false });
        }
      }}
    >
      <Button
        style={{
          position: "absolute",
          top: 0,
          right: 10,
          zIndex: 1,
          cursor: "pointer"
        }}
        minimal
        intent="primary"
        data-tip="Hide Track Properties"
        icon="cross"
        onClick={() => setProperties({ isOpen: false })}
      ></Button>
      {trackInner}
    </div>
  );
};

function RowItem({ item, title, units }) {
  const propertyClass = title.split(" ").join("-").toLowerCase();
  return (
    <div className={`ve-flex-row property-${propertyClass}`}>
      <div style={{ fontWeight: "bold" }} className="ve-column-left">
        {title}
      </div>
      <div className="ve-column-right">
        {item} {units ?? ""}
      </div>
    </div>
  );
}

const HeaderItem = ({ title }) => {
  return (
    <h5
      style={{
        margin: 0,
        fontSize: 15,
        fontWeight: "bold",
        textAlign: "center",
        padding: "5px 0",
        borderBottom: "1px solid #f1f1f1"
      }}
    >
      {title}
    </h5>
  );
};
