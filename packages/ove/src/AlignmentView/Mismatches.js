/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */

import {
  Button,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tag
} from "@blueprintjs/core";
import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  findAlignmentDifferences,
  groupConsecutiveDifferences
} from "./findAlignmentDifferences";
import { scrollToAlignmentSelection, updateCaretPosition } from "./utils";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "mismatch", label: "Mismatches" },
  { value: "insertion", label: "Insertions" },
  { value: "deletion", label: "Deletions" },
  { value: "gap", label: "Gaps" }
];

export function FindMismatches(props) {
  const { alignmentJson, id, onFilterChange } = props;
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
    return [{ position: -1, start: -1, end: -1, bases: [""] }, ...filtered];
  }, [allDifferences, activeFilter]);

  const currentCaretPosition = useSelector(
    state =>
      state.VectorEditor.__allEditorsOptions.alignments[id]?.caretPosition
  );

  const [currentIdx, setCurrentIdx] = React.useState(0);

  const currentDiff = differences[currentIdx];
  const disablePrev = currentIdx <= 1;
  const disableNext = currentIdx >= differences.length - 1;

  useEffect(() => {
    setCurrentIdx(0);
  }, [activeFilter]);

  useEffect(() => {
    onFilterChange?.({ activeFilter });
  }, [activeFilter, onFilterChange]);

  useEffect(() => {
    if (currentCaretPosition !== -1) {
      const diffIdx = differences.findIndex(
        (d, i) =>
          i > 0 &&
          currentCaretPosition >= d.start &&
          currentCaretPosition <= d.end + 1
      );
      if (diffIdx !== -1 && diffIdx !== currentIdx) {
        setCurrentIdx(diffIdx);
      }
    }
  }, [currentCaretPosition, differences, currentIdx]);

  const updateView = diff => {
    const idx = differences.indexOf(diff);
    const { start, end } = diff;
    setCurrentIdx(idx);
    updateCaretPosition({ start, end });
    setTimeout(() => {
      scrollToAlignmentSelection();
    }, 0);
  };

  const prevDifference = () => {
    const pivot =
      currentCaretPosition >= 0
        ? currentCaretPosition
        : (differences[currentIdx]?.start ?? 0);
    const prev = [...differences]
      .reverse()
      .find(d => d.start >= 0 && d.start < pivot);
    if (prev) updateView(prev);
  };

  const nextDifference = () => {
    const pivot =
      currentCaretPosition >= 0
        ? currentCaretPosition
        : (differences[currentIdx]?.start ?? -1);
    const next = differences.find(d => d.start > pivot && d.start >= 0);
    if (next) updateView(next);
  };

  const noDifferences = differences.length <= 1;
  const activeOption = FILTER_OPTIONS.find(o => o.value === activeFilter);
  const activeLabel = activeOption?.label ?? "Differences";

  const filterMenu = (
    <Menu>
      {FILTER_OPTIONS.map(({ value, label }) => {
        const count = countsByType[value] ?? 0;
        const isActive = activeFilter === value;
        return (
          <MenuItem
            key={value}
            active={isActive}
            onClick={() => setActiveFilter(value)}
            text={
              <span className="veDiffMenuItem-inner">
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
          <Button
            minimal
            data-tip="Filter difference type"
            small
            rightIcon="caret-down"
            className="veDiffFilter-trigger"
          >
            {activeLabel}
          </Button>
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
            data-tip="Previous difference"
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
            {currentDiff?.start > -1 && (
              <span className="veDiffNav-pos">:{currentDiff.start + 1}</span>
            )}
          </div>
          <Button
            minimal
            small
            data-tip="Next difference"
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
