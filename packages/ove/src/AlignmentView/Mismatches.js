import {
  Button,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tag,
  Tooltip
} from "@blueprintjs/core";
/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import React, { useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  findAlignmentDifferences,
  groupConsecutiveDifferences
} from "./findAlignmentDifferences";
import { scrollToAlignmentSelection, updateCaretPosition } from "./utils";

const FILTER_OPTIONS = [
  { value: "all", label: "All Differences" },
  { value: "mismatch", label: "Mismatches" },
  { value: "insertion", label: "Insertions" },
  { value: "deletion", label: "Deletions" },
  { value: "gap", label: "Gaps" }
];

const FILTER_COLORS = {
  all: "#5c7080",
  mismatch: "#c23030",
  insertion: "#238551",
  deletion: "#c87619",
  gap: "#8a9ba8"
};

export function FindMismatches(props) {
  const { alignmentJson, id } = props;
  const alignedSeqs = useMemo(
    () => alignmentJson.map(t => t.alignmentData?.sequence || ""),
    [alignmentJson]
  );

  const [activeFilter, setActiveFilter] = React.useState("all");

  const allDifferences = useMemo(
    () => groupConsecutiveDifferences(findAlignmentDifferences(alignedSeqs)),
    [alignedSeqs]
  );

  const countsByType = useMemo(() => {
    const counts = { all: 0, mismatch: 0, insertion: 0, deletion: 0, gap: 0 };
    allDifferences.forEach(d => {
      counts[d.type] = (counts[d.type] || 0) + 1;
      counts.all++;
    });
    return counts;
  }, [allDifferences]);

  const differences = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? allDifferences
        : allDifferences.filter(d => d.type === activeFilter);
    return [{ position: 0, start: 0, end: 0, bases: [""] }, ...filtered];
  }, [allDifferences, activeFilter]);

  const currentCaretPosition = useSelector(
    state =>
      state.VectorEditor.__allEditorsOptions.alignments[id]?.caretPosition
  );

  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [disablePrev, setDisablePrev] = React.useState(true);
  const [disableNext, setDisableNext] = React.useState(false);

  const currentDiff = differences[currentIdx];

  const handleButtonsState = useCallback(
    caret => {
      if (differences.length <= 1) {
        setDisablePrev(true);
        setDisableNext(true);
        return;
      }
      const firstPos = differences[1].start;
      const lastPos = differences[differences.length - 1].start;
      setDisablePrev(caret <= firstPos);
      setDisableNext(caret >= lastPos);
    },
    [differences]
  );

  useEffect(() => {
    setCurrentIdx(0);
    setDisablePrev(true);
    setDisableNext(differences.length <= 1);
  }, [differences.length]);

  useEffect(() => {
    if (currentCaretPosition !== -1) {
      const diffIdx = differences.findIndex(
        d =>
          currentCaretPosition >= d.start && currentCaretPosition <= d.end + 1
      );
      if (diffIdx !== -1 && diffIdx !== currentIdx) {
        handleButtonsState(currentCaretPosition);
        setCurrentIdx(diffIdx);
      }
    }
  }, [currentCaretPosition, differences, currentIdx, handleButtonsState]);

  const updateView = diff => {
    const idx = differences.indexOf(diff);
    const { start, end } = diff;
    handleButtonsState(start);
    setCurrentIdx(idx);
    updateCaretPosition({ start, end });
    setTimeout(() => {
      scrollToAlignmentSelection();
    }, 0);
  };

  const prevDifference = () => {
    if (currentIdx > 1) {
      // Use index-based step as primary; override with caret-based search
      // when the user has manually moved the caret to a specific position.
      let prev = differences[Math.max(1, currentIdx - 1)];
      if (currentCaretPosition > 0) {
        const caretBased = [...differences]
          .reverse()
          .find(d => d.start < currentCaretPosition && d.start > 0);
        if (caretBased) prev = caretBased;
      }
      if (prev) updateView(prev);
    }
  };

  const nextDifference = () => {
    if (currentIdx < differences.length - 1) {
      // Use index-based step as primary; override with caret-based search
      // when the user has manually moved the caret to a specific position.
      let next = differences[Math.min(differences.length - 1, currentIdx + 1)];
      if (currentCaretPosition > 0) {
        const caretBased = differences.find(
          d => d.start > currentCaretPosition && d.start > 1
        );
        if (caretBased) next = caretBased;
      }
      if (next) updateView(next);
    }
  };

  const noDifferences = differences.length <= 1;
  const activeOption = FILTER_OPTIONS.find(o => o.value === activeFilter);
  const activeLabel = activeOption?.label ?? "Differences";
  const activeColor = FILTER_COLORS[activeFilter];

  const filterMenu = (
    <Menu>
      {FILTER_OPTIONS.map(({ value, label }) => {
        const color = FILTER_COLORS[value];
        const count = countsByType[value] ?? 0;
        const isActive = activeFilter === value;
        return (
          <MenuItem
            key={value}
            active={isActive}
            onClick={() => setActiveFilter(value)}
            text={
              <span className="veDiffMenuItem-inner">
                <span
                  className="veDiffMenuItem-dot"
                  style={{ background: color }}
                />
                {label}
                <Tag round minimal style={{ marginLeft: 6 }}>
                  {count}
                </Tag>
              </span>
            }
          />
        );
      })}
    </Menu>
  );

  return (
    <div className="veDiffNavigator">
      {/* Filter dropdown — single button replacing 5 filter chips */}
      <Popover
        minimal
        position={Position.BOTTOM_LEFT}
        content={filterMenu}
        target={
          <Tooltip content="Filter difference type">
            <Button
              minimal
              small
              rightIcon="caret-down"
              className="veDiffFilter-trigger"
            >
              <span className="veDiffFilter-trigger-inner">
                <span
                  className="veDiffFilter-dot"
                  style={{ background: activeColor }}
                />
                {activeLabel}
              </span>
            </Button>
          </Tooltip>
        }
      />

      {/* Navigation control */}
      {noDifferences ? (
        <span className="veDiffNav-empty">
          no{" "}
          {activeFilter === "all" ? "differences" : activeLabel.toLowerCase()}
        </span>
      ) : (
        <div className="veDiffNav">
          <Button
            minimal
            small
            icon="arrow-left"
            intent={Intent.PRIMARY}
            onClick={prevDifference}
            disabled={disablePrev}
          />
          <div className="veDiffNav-center">
            <span className="veDiffNav-fraction">
              {currentIdx}
              <span className="veDiffNav-sep">/</span>
              {differences.length - 1}
            </span>
            {currentDiff?.start > 1 && (
              <span className="veDiffNav-pos">
                :{currentDiff.start + 1}
                {currentDiff.end > currentDiff.start &&
                  `–${currentDiff.end + 1}`}
              </span>
            )}
          </div>
          <Button
            minimal
            small
            icon="arrow-right"
            intent={Intent.PRIMARY}
            onClick={nextDifference}
            disabled={disableNext}
          />
        </div>
      )}
    </div>
  );
}

export default FindMismatches;
