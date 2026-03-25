/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import React, {
  useEffect,
  useCallback,
  useReducer,
  useRef,
  useState
} from "react";
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
  findSequenceMatches,
  getFeatureToColorMap
} from "@teselagen/sequence-utils";
import { debounce } from "lodash-es";
import { getSingular } from "../utils/annotationTypes";
import { MAX_MATCHES_DISPLAYED } from "../constants/findToolConstants";
import { getGapMap } from "./getGapMap";
import { scrollToAlignmentSelection, updateCaretPosition } from "./utils";
import "./style.css";
import "../FindBar/style.css";

const MATCH_COLOR = "gold";
const CURRENT_MATCH_COLOR = "green";
const MISMATCH_COLOR = "red";
const ANNOTATION_TYPES = ["features", "parts", "primers"];

const initialSearchState = {
  searchText: "",
  matches: [],
  currentMatchIndex: 0,
  searched: false,
  featureMatches: [],
  searchScope: "reference",
  dnaOrAA: "DNA",
  ambiguousOrLiteral: "LITERAL",
  mismatchesAllowed: 0
};

function searchReducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH_TEXT":
      return { ...state, searchText: action.payload };
    case "SET_MATCHES":
      return {
        ...state,
        matches: action.payload.matches,
        currentMatchIndex: action.payload.currentMatchIndex
      };
    case "SET_CURRENT_MATCH_INDEX":
      return { ...state, currentMatchIndex: action.payload };
    case "SET_SEARCHED":
      return { ...state, searched: action.payload };
    case "SEARCH_COMPLETE":
      return {
        ...state,
        matches: action.payload.matches,
        currentMatchIndex: action.payload.currentMatchIndex,
        searched: action.payload.searched
      };
    case "SET_FEATURE_MATCHES":
      return { ...state, featureMatches: action.payload };
    case "SET_SCOPE":
      return { ...state, searchScope: action.payload };
    case "SET_DNA_OR_AA":
      return { ...state, dnaOrAA: action.payload };
    case "SET_AMBIGUOUS_OR_LITERAL":
      return { ...state, ambiguousOrLiteral: action.payload };
    case "SET_MISMATCHES_ALLOWED":
      return { ...state, mismatchesAllowed: Math.max(0, action.payload) };
    case "RESET":
      return { ...initialSearchState };
    default:
      return state;
  }
}

export function AlignmentSearchBar(props) {
  const { alignmentTracks = [], setSearchMatchLayers } = props;

  const [searchState, dispatch] = useReducer(searchReducer, initialSearchState);
  const {
    searchText,
    matches,
    currentMatchIndex,
    searched,
    featureMatches,
    searchScope,
    dnaOrAA,
    ambiguousOrLiteral,
    mismatchesAllowed
  } = searchState;

  const debouncedSearch = useRef(
    debounce((text, search, featureSearch) => {
      search(text);
      featureSearch(text);
    }, 50)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const [highlightAll, setHighlightAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => {
      const next = !prev;
      if (!next) setIsPopoverOpen(true);
      return next;
    });
  }, [setIsPopoverOpen]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    if (setSearchMatchLayers) setSearchMatchLayers([]);
  }, [setSearchMatchLayers]);

  const buildMatchLayers = useCallback(
    (allMatches, activeIndex) => {
      if (!setSearchMatchLayers) return;
      if (!allMatches.length) {
        setSearchMatchLayers([]);
        return;
      }
      const makeMismatchLayers = match =>
        (match.mismatchAlignmentPositions || []).map(pos => ({
          start: pos,
          end: pos,
          color: MISMATCH_COLOR,
          className: "veSearchMismatch",
          trackIndex: match.trackIndex,
          ignoreGaps: true,
          hideCarets: true
        }));

      const layers = highlightAll
        ? allMatches.flatMap((match, i) => [
            {
              start: match.alignmentStart,
              end: match.alignmentEnd,
              color: i === activeIndex ? CURRENT_MATCH_COLOR : MATCH_COLOR,
              className:
                i === activeIndex ? "veSearchLayerActive" : "veSearchLayer",
              trackIndex: match.trackIndex,
              ignoreGaps: true
            },
            ...makeMismatchLayers(match)
          ])
        : [
            {
              start: allMatches[activeIndex].alignmentStart,
              end: allMatches[activeIndex].alignmentEnd,
              color: CURRENT_MATCH_COLOR,
              className: "veSearchLayerActive",
              trackIndex: allMatches[activeIndex].trackIndex,
              ignoreGaps: true
            },
            ...makeMismatchLayers(allMatches[activeIndex])
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
        scrollToAlignmentSelection();
      }, 0);
      buildMatchLayers(allMatches, index);
    },
    [buildMatchLayers]
  );

  const runSearch = useCallback(
    text => {
      const query = text.trim();
      if (!query) {
        dispatch({
          type: "SEARCH_COMPLETE",
          payload: { matches: [], currentMatchIndex: 0, searched: false }
        });
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
            end: m.index + m.match.length - 1,
            mismatchPositions: m.mismatchPositions
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
        hitsToProcess.forEach(({ start, end, mismatchPositions }) => {
          const alignmentStart = start + gapOffset(start);
          const alignmentEnd = end + gapOffset(end);
          const mismatchAlignmentPositions = (mismatchPositions || []).map(
            p => {
              const absPos = start + p;
              return absPos + gapOffset(absPos);
            }
          );
          allMatches.push({
            trackIndex,
            alignmentStart,
            alignmentEnd,
            mismatchAlignmentPositions
          });
        });
      });

      const results = query.length < 2 ? allMatches.slice(0, 1) : allMatches;

      dispatch({
        type: "SEARCH_COMPLETE",
        payload: { matches: results, currentMatchIndex: 0, searched: true }
      });

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

  const runFeatureSearch = useCallback(
    text => {
      const query = text.trim().toLowerCase();
      if (!query) {
        dispatch({ type: "SET_FEATURE_MATCHES", payload: [] });
        return;
      }

      const tracksToSearch =
        searchScope === "reference"
          ? alignmentTracks.slice(0, 1)
          : alignmentTracks;

      const allMatches = [];
      tracksToSearch.forEach((track, trackIndex) => {
        const { sequenceData, alignmentData } = track;
        const alignedSeq = alignmentData?.sequence || "";
        const gapMap = getGapMap(alignedSeq);
        const gapOffset = n => gapMap[n] ?? gapMap[gapMap.length - 1] ?? 0;
        const trackName =
          alignmentData?.name || sequenceData?.name || sequenceData?.id || "";

        ANNOTATION_TYPES.forEach(type => {
          const anns = sequenceData?.[type];
          if (!anns) return;
          const annsArray = Array.isArray(anns) ? anns : Object.values(anns);
          annsArray.forEach(ann => {
            if (!ann.name) return;
            if (ann.name.toLowerCase().includes(query)) {
              const alignmentStart = ann.start + gapOffset(ann.start);
              const alignmentEnd = ann.end + gapOffset(ann.end);
              allMatches.push({
                trackIndex,
                trackName,
                type,
                annotation: ann,
                alignmentStart,
                alignmentEnd
              });
            }
          });
        });
      });

      dispatch({ type: "SET_FEATURE_MATCHES", payload: allMatches });
    },
    [alignmentTracks, searchScope]
  );

  const goToPrev = useCallback(() => {
    if (!matches.length) return;
    const newIndex =
      currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1;
    dispatch({ type: "SET_CURRENT_MATCH_INDEX", payload: newIndex });
    navigateTo(matches, newIndex);
  }, [matches, currentMatchIndex, navigateTo]);

  const goToNext = useCallback(() => {
    if (!matches.length) return;
    const newIndex =
      currentMatchIndex === matches.length - 1 ? 0 : currentMatchIndex + 1;
    dispatch({ type: "SET_CURRENT_MATCH_INDEX", payload: newIndex });
    navigateTo(matches, newIndex);
  }, [matches, currentMatchIndex, navigateTo]);
  const handleKeyDown = useCallback(
    e => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      if (e.key === "Enter") {
        if (e.shiftKey) {
          goToPrev();
        } else {
          goToNext();
        }
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [goToPrev, goToNext]
  );
  // Re-run both searches when search options change (only if a search has been performed)
  useEffect(() => {
    if (!searched || !searchText.trim()) return;
    runSearch(searchText);
    runFeatureSearch(searchText);
  }, [
    searchScope,
    dnaOrAA,
    ambiguousOrLiteral,
    mismatchesAllowed,
    runSearch,
    runFeatureSearch,
    searched,
    searchText
  ]);

  // Disable and reset highlightAll when query is too short
  useEffect(() => {
    if (searchText.trim().length < 1) setHighlightAll(false);
  }, [searchText]);

  // Rebuild layers when highlightAll toggles without re-searching
  const prevHighlightAll = useRef(highlightAll);
  useEffect(() => {
    if (prevHighlightAll.current !== highlightAll) {
      prevHighlightAll.current = highlightAll;
      if (matches.length) buildMatchLayers(matches, currentMatchIndex);
    }
  }, [highlightAll, matches, currentMatchIndex, buildMatchLayers]);

  const hasMatches = matches.length > 0;

  const handleChange = useCallback(
    e => {
      const value = e.target.value;
      dispatch({ type: "SET_SEARCH_TEXT", payload: value });
      debouncedSearch(value, runSearch, runFeatureSearch);
    },
    [debouncedSearch, runSearch, runFeatureSearch]
  );

  const handleFeatureClick = useCallback(featureMatch => {
    updateCaretPosition({
      start: featureMatch.alignmentStart,
      end: featureMatch.alignmentEnd
    });
    setTimeout(() => {
      scrollToAlignmentSelection();
    }, 0);
  }, []);

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
              <FindOptionsPanel
                dnaOrAA={dnaOrAA}
                ambiguousOrLiteral={ambiguousOrLiteral}
                mismatchesAllowed={mismatchesAllowed}
                searchScope={searchScope}
                searchText={searchText}
                matches={matches}
                dispatch={dispatch}
                highlightAll={highlightAll}
                setHighlightAll={setHighlightAll}
                isExpanded={isExpanded}
                onToggleExpanded={handleToggleExpanded}
              />
            </div>
          }
          target={<Button minimal icon="wrench" data-tip="Options" />}
        />
      )}
      {matchCounter}
      <Button
        minimal
        small
        icon="caret-left"
        data-tip="Previous"
        disabled={!hasMatches}
        onClick={goToPrev}
      />
      <Button
        minimal
        small
        icon="caret-right"
        data-tip="Next"
        disabled={!hasMatches}
        onClick={goToNext}
      />
      <Button
        minimal
        small
        data-tip="Close (Esc)"
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
        data-tip="Search"
        onClick={() => setIsOpen(true)}
      />
    );
  }

  // Annotation results popup: only shown when feature matches exist
  const annotationPopoverOpen = searched && featureMatches.length > 0;

  const inputEl = (
    <InputGroup
      className="tg-find-tool-input alignment-search-bar"
      leftIcon="search"
      placeholder="Search..."
      autoFocus
      value={searchText}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      rightElement={inlineNavEl}
    />
  );

  return (
    <div style={{ position: "relative" }}>
      {!isExpanded && (
        <Popover
          autoFocus={false}
          enforceFocus={false}
          modifiers={{
            arrow: false
          }}
          position={Position.BOTTOM}
          isOpen={annotationPopoverOpen}
          content={
            <AnnotationResultsComp
              featureMatches={featureMatches}
              onClickMatch={handleFeatureClick}
            />
          }
          target={inputEl}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <TextArea
              autoFocus
              placeholder="Search sequences and annotations..."
              value={searchText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{ resize: "vertical", width: 350, height: 190 }}
            />
            {annotationPopoverOpen && (
              <AnnotationResultsComp
                featureMatches={featureMatches}
                onClickMatch={handleFeatureClick}
              />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {expandedNavEl}
            <FindOptionsPanel
              dnaOrAA={dnaOrAA}
              ambiguousOrLiteral={ambiguousOrLiteral}
              mismatchesAllowed={mismatchesAllowed}
              searchScope={searchScope}
              searchText={searchText}
              matches={matches}
              dispatch={dispatch}
              highlightAll={highlightAll}
              setHighlightAll={setHighlightAll}
              isExpanded={isExpanded}
              onToggleExpanded={handleToggleExpanded}
            />
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

function AnnotationResultsComp({ featureMatches, onClickMatch }) {
  const byType = {};
  ANNOTATION_TYPES.forEach(type => {
    byType[type] = [];
  });
  featureMatches.forEach(match => {
    if (byType[match.type]) {
      byType[match.type].push(match);
    }
  });

  const featureColorMap = getFeatureToColorMap({ includeHidden: true });

  return (
    <div className="veAnnotationFindMatches">
      {ANNOTATION_TYPES.map(type => {
        const anns = byType[type];
        if (!anns.length) return null;
        const showing = anns.slice(0, 10);
        return (
          <div key={type}>
            <div className="veAnnotationFoundType">
              {anns.length} {getSingular(type)} match
              {anns.length > 1 ? "es" : null}
              {anns.length > 10 ? ` (only showing 10)` : null}:
            </div>
            <div>
              {showing.map((match, i) => {
                const { annotation } = match;
                const annotationColor =
                  type === "parts"
                    ? "#ac68cc"
                    : annotation.color || featureColorMap[annotation.type];
                return (
                  <div
                    key={i}
                    onClick={() => onClickMatch(match)}
                    className="veAnnotationFoundResult"
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          background: annotationColor,
                          height: 15,
                          width: 15,
                          marginRight: 3
                        }}
                      />
                      {annotation.name}
                    </div>
                    <div className="veAnnotationFoundResultRange">
                      {annotation.start + 1}-{annotation.end + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FindOptionsPanel({
  dnaOrAA,
  ambiguousOrLiteral,
  mismatchesAllowed,
  searchScope,
  searchText,
  matches,
  dispatch,
  highlightAll,
  setHighlightAll,
  isExpanded,
  onToggleExpanded
}) {
  return (
    <>
      <TgHTMLSelect
        options={[
          { label: "DNA", value: "DNA" },
          { label: "Amino Acids", value: "AA" }
        ]}
        value={dnaOrAA}
        onChange={e =>
          dispatch({ type: "SET_DNA_OR_AA", payload: e.target.value })
        }
      />
      <div style={{ display: "flex" }}>
        <TgHTMLSelect
          options={[
            { label: "Literal", value: "LITERAL" },
            { label: "Ambiguous", value: "AMBIGUOUS" }
          ]}
          value={ambiguousOrLiteral}
          onChange={e =>
            dispatch({
              type: "SET_AMBIGUOUS_OR_LITERAL",
              payload: e.target.value
            })
          }
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
      </div>
      <div
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
          onValueChange={value =>
            dispatch({
              type: "SET_MISMATCHES_ALLOWED",
              payload: Number.parseInt(value, 10) || 0
            })
          }
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
      </div>
      <Switch
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
      </Switch>
      <Switch checked={isExpanded} onChange={onToggleExpanded}>
        Expanded
      </Switch>
      <div style={{ marginTop: 8 }}>
        <RadioGroup
          label="Search in"
          selectedValue={searchScope}
          onChange={e =>
            dispatch({ type: "SET_SCOPE", payload: e.target.value })
          }
        >
          <Radio label="Reference sequence only" value="reference" />
          <Radio label="All sequences" value="all" />
        </RadioGroup>
      </div>
    </>
  );
}

export default AlignmentSearchBar;
