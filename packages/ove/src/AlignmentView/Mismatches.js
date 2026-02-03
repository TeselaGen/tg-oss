/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@blueprintjs/core";
import { updateCaretPosition } from "./utils";

export function FindMismatches(props) {
  const { alignmentJson, id } = props;
  const alignedSeqs = alignmentJson.map(t => t.alignmentData?.sequence || "");

  // Find mismatch positions
  const mismatches = React.useMemo(() => {
    const result = [{ position: 0, bases: [""] }];

    if (alignedSeqs.length > 1 && alignedSeqs[0].length) {
      for (let i = 0; i < alignedSeqs[0].length; i++) {
        const bases = alignedSeqs.map(seq => seq[i]);
        const uniqueBases = new Set(bases);
        // Ignore gaps-only columns
        if (uniqueBases.size > 1 && !uniqueBases.has("-")) {
          result.push({ position: i, bases });
        }
      }
    }
    return result;
  }, [alignedSeqs]);

  const currentCaretPosition = useSelector(
    state =>
      state.VectorEditor.__allEditorsOptions.alignments[id]?.caretPosition
  );

  // State for navigation
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [disablePrev, setDisablePrev] = React.useState(true);
  const [disableNext, setDisableNext] = React.useState(false);

  // Current mismatch info
  const currentMismatch = mismatches[currentIdx];

  const handleButtonsState = React.useCallback(
    caret => {
      if (!mismatches.length) {
        setDisablePrev(true);
        setDisableNext(true);
        return;
      }

      const firstMismatchPos = mismatches[1].position;
      const lastMismatchPos = mismatches[mismatches.length - 1].position;

      setDisablePrev(caret <= firstMismatchPos);
      setDisableNext(caret >= lastMismatchPos);
    },
    [mismatches]
  );

  // Scroll to the current mismatch position when it changes
  useEffect(() => {
    if (mismatches.length === 1) {
      setDisablePrev(true);
      setDisableNext(true);
      return;
    }

    if (currentMismatch.position === 0) return;

    if (currentCaretPosition !== -1) {
      handleButtonsState(currentCaretPosition);
      return;
    }
  }, [
    currentIdx,
    currentMismatch,
    currentCaretPosition,
    handleButtonsState,
    mismatches
  ]);

  // Update currentIdx when caret moves to a mismatch
  useEffect(() => {
    if (currentCaretPosition !== -1) {
      const mismatchIdx = mismatches.findIndex(
        m =>
          m.position === currentCaretPosition ||
          m.position === currentCaretPosition - 1
      );
      if (mismatchIdx !== -1 && mismatchIdx !== currentIdx) {
        setCurrentIdx(mismatchIdx);
      }
    }
  }, [currentCaretPosition, mismatches, currentIdx]);

  const updateView = mismatch => {
    const idx = mismatches.indexOf(mismatch);
    const position = mismatch.position;

    handleButtonsState(position);

    setCurrentIdx(idx);

    updateCaretPosition({ start: position, end: position });
  };

  // Handle mismatch navigation
  const prevMismatch = () => {
    if (currentIdx > 1) {
      const newIdx = Math.max(0, currentIdx - 1);
      let prev = mismatches[newIdx];

      if (currentCaretPosition > 0) {
        prev = [...mismatches]
          .reverse()
          .find(m => m.position < currentCaretPosition);
      }

      if (prev) {
        updateView(prev);
      }
    }
  };

  const nextMismatch = () => {
    if (currentIdx < mismatches.length - 1) {
      const newIdx = Math.min(mismatches.length - 1, currentIdx + 1);
      let next = mismatches[newIdx];

      if (currentCaretPosition > 0) {
        next = mismatches.find(
          m => m.position > currentCaretPosition && m.position > 1
        );
      }

      if (next) {
        updateView(next);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10
      }}
    >
      {mismatches.length === 1 ? (
        <span style={{ fontStyle: "italic", color: "grey" }}>
          no mismatches
        </span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center"
            }}
          >
            <strong>Mismatches</strong>
            <div style={{ display: "flex", gap: 2 }}>
              <Button
                intent="primary"
                icon="arrow-left"
                data-tip="Previous Mismatch"
                onClick={prevMismatch}
                disabled={disablePrev}
                small
                minimal
              />
              <Button
                intent="primary"
                icon="arrow-right"
                data-tip="Next Mismatch"
                onClick={nextMismatch}
                disabled={disableNext}
                small
                minimal
              />
            </div>
          </div>
          <span
            style={{
              fontSize: "0.8em",
              color: "grey",
              lineHeight: "0.8em"
            }}
          >
            {currentMismatch.position > 1 && (
              <span>Position: {currentMismatch.position + 1} | </span>
            )}
            ({currentIdx} of {mismatches.length - 1})
          </span>
        </div>
      )}
    </div>
  );
}

export default FindMismatches;
