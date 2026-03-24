/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import React, { useEffect, useCallback } from "react";
import {
  Button,
  InputGroup,
  NumericInput,
  Popover,
  Position,
  Radio,
  RadioGroup,
  Switch,
  TextArea,
  Tooltip
} from "@blueprintjs/core";
import { InfoHelper, TgHTMLSelect } from "@teselagen/ui";
import {
  findApproxMatches,
  findSequenceMatches
} from "@teselagen/sequence-utils";
import { MAX_MATCHES_DISPLAYED } from "../constants/findToolConstants";
import { getGapMap } from "./getGapMap";
import { scrollToAlignmentSelection, updateCaretPosition } from "./utils";
import "./style.css";

const MATCH_COLOR = "gold";
const CURRENT_MATCH_COLOR = "green";

export function AlignmentSearchBar(props) {
  const { alignmentTracks = [], id, setSearchMatchLayers } = props;

  const [searchText, setSearchText] = React.useState("");
  const [matches, setMatches] = React.useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = React.useState(0);
  const [searched, setSearched] = React.useState(false);
  const [searchScope, setSearchScope] = React.useState("reference");
  const [dnaOrAA, setDnaOrAA] = React.useState("DNA");
  const [ambiguousOrLiteral, setAmbiguousOrLiteral] = React.useState("LITERAL");
  const [mismatchesAllowed, setMismatchesAllowed] = React.useState(0);
  const [highlightAll, setHighlightAll] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  useEffect(() => {
    setMatches([]);
    setCurrentMatchIndex(0);
    setSearched(false);
    setSearchMatchLayers([]);
  }, [setSearchMatchLayers]);

  const buildMatchLayers = React.useCallback(
    (allMatches, activeIndex) => {
      if (!setSearchMatchLayers) return;
      if (!allMatches.length) {
        setSearchMatchLayers([]);
        return;
      }
      const layers = highlightAll
        ? allMatches.map((match, i) => ({
            start: match.alignmentStart,
            end: match.alignmentEnd,
            color: i === activeIndex ? CURRENT_MATCH_COLOR : MATCH_COLOR,
            className:
              i === activeIndex ? "veSearchLayerActive" : "veSearchLayer",
            trackIndex: match.trackIndex,
            ignoreGaps: true
          }))
        : [
            {
              start: allMatches[activeIndex].alignmentStart,
              end: allMatches[activeIndex].alignmentEnd,
              color: CURRENT_MATCH_COLOR,
              className: "veSearchLayerActive",
              trackIndex: allMatches[activeIndex].trackIndex,
              ignoreGaps: true
            }
          ];
      setSearchMatchLayers(layers);
    },
    [setSearchMatchLayers, highlightAll]
  );

  const navigateTo = useCallback(
    (allMatches, index) => {
      const match = allMatches[index];
      if (!match) return;
      updateCaretPosition({
        start: match.alignmentStart,
        end: match.alignmentEnd
      });
      setTimeout(() => {
        scrollToAlignmentSelection(id, match.alignmentStart);
      }, 0);
      buildMatchLayers(allMatches, index);
    },
    [id, buildMatchLayers]
  );

  const runSearch = useCallback(
    text => {
      const query = text.trim();
      if (!query) {
        setMatches([]);
        setCurrentMatchIndex(0);
        setSearched(false);
        if (setSearchMatchLayers) setSearchMatchLayers([]);
        return;
      }

      const tracksToSearch =
        searchScope === "reference"
          ? alignmentTracks.slice(0, 1)
          : alignmentTracks;

      const allMatches = [];
      tracksToSearch.forEach((track, trackIndex) => {
        const rawSeq = track.sequenceData?.sequence || "";
        const alignedSeq = track.alignmentData?.sequence || "";
        const gapMap = getGapMap(alignedSeq);
        const gapOffset = n => gapMap[n] ?? gapMap[gapMap.length - 1] ?? 0;

        let seqMatches = [];
        if (
          dnaOrAA === "DNA" &&
          ambiguousOrLiteral === "LITERAL" &&
          mismatchesAllowed > 0
        ) {
          const approxMatches = findApproxMatches(
            query.toLowerCase(),
            rawSeq.toLowerCase(),
            mismatchesAllowed,
            false
          );
          seqMatches = approxMatches.map(m => ({
            start: m.index,
            end: m.index + m.match.length - 1
          }));
        } else {
          seqMatches = findSequenceMatches(rawSeq, query, {
            isCircular: false,
            isAmbiguous: ambiguousOrLiteral === "AMBIGUOUS",
            isProteinSearch: dnaOrAA !== "DNA",
            searchReverseStrand: dnaOrAA === "DNA"
          });
        }

        const hitsToProcess =
          query.length < 2 ? seqMatches.slice(0, 1) : seqMatches;
        hitsToProcess.forEach(({ start, end }) => {
          const alignmentStart = start + gapOffset(start);
          const alignmentEnd = end + gapOffset(end);
          allMatches.push({ trackIndex, alignmentStart, alignmentEnd });
        });
      });

      const results = query.length < 2 ? allMatches.slice(0, 1) : allMatches;

      setMatches(results);
      setCurrentMatchIndex(0);
      setSearched(true);

      if (results.length) {
        navigateTo(results, 0);
      } else {
        if (setSearchMatchLayers) setSearchMatchLayers([]);
      }
    },
    [
      alignmentTracks,
      navigateTo,
      searchScope,
      dnaOrAA,
      ambiguousOrLiteral,
      mismatchesAllowed,
      setSearchMatchLayers
    ]
  );

  const handleKeyDown = useCallback(
    e => {
      if (e.key === "Escape") {
        setSearchText("");
        setMatches([]);
        setCurrentMatchIndex(0);
        setSearched(false);
        if (setSearchMatchLayers) setSearchMatchLayers([]);
      }
    },
    [setSearchMatchLayers]
  );

  const goToPrev = useCallback(() => {
    if (!matches.length) return;
    const newIndex =
      currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(newIndex);
    navigateTo(matches, newIndex);
  }, [matches, currentMatchIndex, navigateTo]);

  const goToNext = useCallback(() => {
    if (!matches.length) return;
    const newIndex =
      currentMatchIndex === matches.length - 1 ? 0 : currentMatchIndex + 1;
    setCurrentMatchIndex(newIndex);
    navigateTo(matches, newIndex);
  }, [matches, currentMatchIndex, navigateTo]);

  // Re-run search when search options change (only if a search has been performed)
  useEffect(() => {
    if (searched && searchText.trim()) runSearch(searchText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchScope, dnaOrAA, ambiguousOrLiteral, mismatchesAllowed]);

  // Disable and reset highlightAll when query is too short
  useEffect(() => {
    if (searchText.trim().length < 1) setHighlightAll(false);
  }, [searchText]);

  // Rebuild layers when highlightAll toggles without re-searching
  useEffect(() => {
    if (matches.length) buildMatchLayers(matches, currentMatchIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightAll]);

  const hasMatches = matches.length > 0;

  const handleChange = useCallback(
    e => {
      const value = e.target.value;
      setSearchText(value);
      runSearch(value);
    },
    [runSearch]
  );

  const findOptionsEls = React.useMemo(
    () => [
      <TgHTMLSelect
        key="dnaoraa"
        options={[
          { label: "DNA", value: "DNA" },
          { label: "Amino Acids", value: "AA" }
        ]}
        value={dnaOrAA}
        onChange={e => setDnaOrAA(e.target.value)}
      />,
      <div style={{ display: "flex" }} key="ambiguousorliteral">
        <TgHTMLSelect
          options={[
            { label: "Literal", value: "LITERAL" },
            { label: "Ambiguous", value: "AMBIGUOUS" }
          ]}
          value={ambiguousOrLiteral}
          onChange={e => setAmbiguousOrLiteral(e.target.value)}
        />
        <InfoHelper style={{ marginLeft: 10 }}>
          <div>
            Ambiguous substitutions:
            <div style={{ display: "flex", fontSize: 12 }}>
              <div style={{ marginRight: 20 }}>
                <div style={{ fontSize: 14, marginBottom: 4, marginTop: 5 }}>
                  DNA:
                </div>
                <div>M: AC</div>
                <div>R: AG</div>
                <div>W: AT</div>
                <div>S: CG</div>
                <div>Y: CT</div>
                <div>K: GT</div>
                <div>V: ACG</div>
                <div>H: ACT</div>
                <div>D: AGT</div>
                <div>B: CGT</div>
                <div>X: GATC</div>
                <div>N: GATC</div>
                <div>*: any</div>
              </div>
              <div>
                <div style={{ fontSize: 14, marginBottom: 4, marginTop: 5 }}>
                  AA:
                </div>
                <div>B: ND</div>
                <div>J: IL</div>
                <div>X: ACDEFGHIKLMNPQRSTVWY</div>
                <div>Z: QE</div>
                <div>*: any</div>
              </div>
            </div>
          </div>
        </InfoHelper>
      </div>,
      <div
        key="mismatchesAllowed"
        style={{
          marginTop: "8px",
          display: "flex",
          flexDirection: "row",
          gap: "3px",
          alignItems: "center"
        }}
      >
        <label>Mismatches Allowed:</label>
        <NumericInput
          min={0}
          max={10}
          className="tg-mismatches-allowed-input"
          style={{ width: "60px" }}
          value={mismatchesAllowed}
          disabled={dnaOrAA !== "DNA" || ambiguousOrLiteral !== "LITERAL"}
          onValueChange={value => {
            setMismatchesAllowed(Math.max(0, Number.parseInt(value, 10) || 0));
          }}
        />
        <InfoHelper style={{ marginLeft: 10 }}>
          <div>
            Number of mismatches allowed when searching DNA sequences with
            literal matching.
            <br />
            <br />
            Higher values may slow down search performance.
          </div>
        </InfoHelper>
      </div>,
      <Switch
        key="highlightall"
        checked={highlightAll}
        onChange={() => setHighlightAll(v => !v)}
        disabled={
          searchText.trim().length < 2 || matches.length > MAX_MATCHES_DISPLAYED
        }
      >
        <Tooltip
          disabled={matches.length <= MAX_MATCHES_DISPLAYED}
          content={`Disabled because there are >${MAX_MATCHES_DISPLAYED} matches`}
        >
          Highlight All
        </Tooltip>
      </Switch>,
      <Switch
        key="expanded"
        checked={isExpanded}
        onChange={() => {
          setIsExpanded(v => {
            const next = !v;
            if (!next) setIsPopoverOpen(true); // re-open popover when collapsing back to inline
            return next;
          });
        }}
      >
        Expanded
      </Switch>,
      <div key="searchscope" style={{ marginTop: 8 }}>
        <RadioGroup
          label="Search in"
          selectedValue={searchScope}
          onChange={e => setSearchScope(e.target.value)}
        >
          <Radio label="Reference sequence only" value="reference" />
          <Radio label="All sequences" value="all" />
        </RadioGroup>
      </div>
    ],
    [
      dnaOrAA,
      ambiguousOrLiteral,
      mismatchesAllowed,
      highlightAll,
      isExpanded,
      searchText,
      matches,
      searchScope
    ]
  );

  const matchCounter = (
    <span
      style={{
        marginRight: 3,
        color: "lightgrey",
        fontSize: "0.9em",
        whiteSpace: "nowrap"
      }}
    >
      {hasMatches ? currentMatchIndex + 1 : 0}/{matches.length}
    </span>
  );

  const inlineNavEl = (
    <span style={{ display: "flex", alignItems: "center" }}>
      {!isExpanded && (
        <Popover
          autoFocus={false}
          enforceFocus={false}
          isOpen={isPopoverOpen}
          onInteraction={setIsPopoverOpen}
          position={Position.TOP}
          content={
            <div
              className="ve-find-options-popover"
              style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: 20,
                paddingBottom: 10,
                paddingTop: 10,
                paddingRight: 20,
                gap: 6
              }}
            >
              {findOptionsEls}
            </div>
          }
          target={<Button minimal icon="wrench" />}
        />
      )}
      {matchCounter}
      <Button
        minimal
        small
        icon="caret-up"
        disabled={!hasMatches}
        onClick={goToPrev}
      />
      <Button
        minimal
        small
        icon="caret-down"
        disabled={!hasMatches}
        onClick={goToNext}
      />
      <Button
        minimal
        small
        icon="small-cross"
        onClick={() => setIsOpen(false)}
      />
    </span>
  );

  const expandedNavEl = (
    <span style={{ display: "flex", alignItems: "center" }}>
      {matchCounter}
      <Button
        minimal
        small
        icon="caret-up"
        disabled={!hasMatches}
        onClick={goToPrev}
      />
      <Button
        minimal
        small
        icon="caret-down"
        disabled={!hasMatches}
        onClick={goToNext}
      />
    </span>
  );

  if (!isOpen) {
    return (
      <Button
        minimal
        small
        intent="primary"
        icon="search"
        rightIcon="caret-right"
        data-tip="Search (Cmd+F)"
        onClick={() => setIsOpen(true)}
      />
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {!isExpanded && (
        <InputGroup
          className="tg-find-tool-input alignment-search-bar"
          leftIcon="search"
          placeholder="Search..."
          type="search"
          autoFocus
          value={searchText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rightElement={inlineNavEl}
        />
      )}
      {isExpanded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            padding: 10,
            paddingBottom: 25,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            zIndex: 50000,
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            borderRadius: 3
          }}
        >
          <TextArea
            autoFocus
            placeholder="Search sequences..."
            value={searchText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ resize: "vertical", width: 350, height: 190 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {expandedNavEl}
            {findOptionsEls}
          </div>
          <Button
            minimal
            style={{ position: "absolute", bottom: 0, right: 0 }}
            onClick={() => setIsOpen(false)}
            icon="cross"
          />
        </div>
      )}
    </div>
  );
}

export default AlignmentSearchBar;
