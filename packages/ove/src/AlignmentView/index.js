import { HorizontalPanelDragHandle } from "./HorizontalPanelDragHandle";
import {
  DragDropContext,
  Droppable,
  Draggable as DndDraggable
} from "@hello-pangea/dnd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { connect } from "react-redux";
import {
  Button,
  Intent,
  Popover,
  Menu,
  MenuItem,
  Tooltip,
  Icon,
  Spinner,
  AnchorButton,
  EditableText
} from "@blueprintjs/core";
import { InfoHelper, Loading, showContextMenu, withStore } from "@teselagen/ui";
import { store as _store } from "@risingstack/react-easy-state";
import { throttle, map, some, isFunction, unset, omit } from "lodash-es";
import { getSequenceDataBetweenRange } from "@teselagen/sequence-utils";
import ReactList from "@teselagen/react-list";
import ReactDOM from "react-dom";

import { NonReduxEnhancedLinearView } from "../LinearView";
import Minimap, { getTrimmedRangesToDisplay } from "./Minimap";
import { compose, branch, renderComponent } from "recompose";
import AlignmentVisibilityTool from "./AlignmentVisibilityTool";
import * as alignmentActions from "../redux/alignments";
import _estimateRowHeight from "../RowView/estimateRowHeight";
import prepareRowData from "../utils/prepareRowData";
import withEditorProps from "../withEditorProps";

import "./style.css";
import {
  editorDragged,
  editorClicked,
  editorDragStarted,
  updateSelectionOrCaret as _updateSelectionOrCaret,
  editorDragStopped
} from "../withEditorInteractions/clickAndDragUtils";
import { ResizeSensor } from "@blueprintjs/core";
import ReactDraggable from "react-draggable";
import draggableClassnames from "../constants/draggableClassnames";
import Caret from "../RowItem/Caret";
import { debounce } from "lodash-es";
import { view } from "@risingstack/react-easy-state";
import { noop } from "lodash-es";
import { massageTickSpacing } from "../utils/massageTickSpacing";
import { getClientX, getClientY } from "../utils/editorUtils";

import UncontrolledSliderWithPlusMinusBtns from "../helperComponents/UncontrolledSliderWithPlusMinusBtns";
import { updateLabelsForInViewFeatures } from "../utils/updateLabelsForInViewFeatures";

import PinchHelper from "../helperComponents/PinchHelper/PinchHelper";
import { showDialog } from "../GlobalDialogUtils";
import { GlobalDialog } from "../GlobalDialog";
import { array_move } from "../ToolBar/array_move";
import classNames from "classnames";
import { getTrackFromEvent } from "./getTrackFromEvent";
import { PerformantSelectionLayer } from "./PerformantSelectionLayer";
import { PairwiseAlignmentView } from "./PairwiseAlignmentView";
import { updateTrackHelper } from "./updateTrackHelper";
// import { getGaps } from "./getGaps";
import { isTargetWithinEl } from "./isTargetWithinEl";
import { EditTrackNameDialog } from "./EditTrackNameDialog";
import { coerceInitialValue } from "./coerceInitialValue";

let charWidthInLinearViewDefault = 12;
try {
  const newVal = JSON.parse(
    window.localStorage.getItem("charWidthInLinearViewDefault")
  );
  if (newVal) charWidthInLinearViewDefault = newVal;
} catch (e) {
  console.error(
    "error setting charWidthInLinearViewDefault from local storage:",
    e
  );
}

export const AlignmentView = props => {
  const {
    alignmentType,
    alignmentRunUpdate,
    alignmentName: _alignmentName,
    caretPosition,
    handleAlignmentSave,
    id,
    isFullyZoomedOut,
    scrollPercentageToJumpTo,
    selectionLayer,
    sequenceData,
    sequenceLength,
    shouldAutosave,
    store,
    height,
    minimapLaneHeight,
    minimapLaneSpacing,
    isInPairwiseOverviewView,
    noVisibilityOptions,
    updateAlignmentSortOrder,
    alignmentSortOrder,
    handleBackButtonClicked,
    allowTrimming,
    additionalSelectionLayerRightClickedOptions,
    selectionLayerRightClicked,
    additionalTopEl,
    additionalTopLeftEl,
    handleAlignmentRename,
    stateTrackingId,
    style,
    unmappedSeqs
  } = props;

  const {
    alignmentId,
    alignmentTrackIndex,
    alignmentTracks = [],
    alignmentVisibilityToolOptions,
    allowTrackNameEdit,
    allowTrackRearrange,
    currentPairwiseAlignmentIndex,
    handleSelectTrack,
    hasTemplate,
    isPairwise,
    linearViewOptions,
    noClickDragHandlers,
    pairwiseAlignments,
    pairwiseOverviewAlignmentTracks,
    upsertAlignmentRun,
    ...rest
  } = props;

  const [width, setWidth] = useState(0);
  const [nameDivWidth, setNameDivWidth] = useState(140);
  const [charWidthInLinearView, _setCharWidthInLinearView] = useState(
    charWidthInLinearViewDefault
  );
  const [alignmentName, setAlignmentName] = useState(_alignmentName);
  const [isTrackDragging, setIsTrackDragging] = useState(false);
  const [saveMessage, setSaveMessage] = useState();
  const [saveMessageLoading, setSaveMessageLoading] = useState(false);
  const [tempTrimBefore, setTempTrimBefore] = useState({});
  const [tempTrimAfter, setTempTrimAfter] = useState({});
  const [tempTrimmingCaret, setTempTrimmingCaret] = useState({});
  const bindOutsideChangeHelper = useRef({});
  const alignmentHolder = useRef(null);
  const alignmentHolderTop = useRef(null);
  const veTracksAndAlignmentHolder = useRef(null);
  const InfiniteScroller = useRef(null);
  const oldAlignmentHolderScrollTop = useRef(0);
  const blockScroll = useRef(false);
  const isZooming = useRef(false);
  const rowData = useRef({});
  const latestMouseY = useRef();
  const easyStore = useRef(
    _store({
      selectionLayer: { start: -1, end: -1 },
      caretPosition: -1,
      percentScrolled: 0,
      viewportWidth: 400,
      verticalVisibleRange: { start: 0, end: 0 }
    })
  );

  const getAllAlignmentsFastaText = useCallback(() => {
    const selectionLayer =
      store.getState().VectorEditor.__allEditorsOptions.alignments[id]
        .selectionLayer || {};
    const seqDataOfAllTracksToCopy = [];
    alignmentTracks.forEach(track => {
      const seqDataToCopy = getSequenceDataBetweenRange(
        track.alignmentData,
        selectionLayer
      ).sequence;
      seqDataOfAllTracksToCopy.push(
        `>${track.alignmentData.name}\r\n${seqDataToCopy}\r\n`
      );
    });
    return seqDataOfAllTracksToCopy.join("");
  }, [alignmentTracks, id, store]);

  useEffect(() => {
    const handleAlignmentCopy = event => {
      if (
        event.key === "c" &&
        !event.shiftKey &&
        (event.metaKey === true || event.ctrlKey === true)
      ) {
        const input = document.createElement("textarea");
        document.body.appendChild(input);
        const seqDataToCopy = getAllAlignmentsFastaText();
        input.value = seqDataToCopy;
        input.select();
        const copySuccess = document.execCommand("copy");
        if (!copySuccess) {
          window.toastr.error("Selection Not Copied");
        } else {
          window.toastr.success("Selection Copied");
        }
        document.body.removeChild(input);
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleAlignmentCopy);
    return () => {
      document.removeEventListener("keydown", handleAlignmentCopy);
    };
  }, [getAllAlignmentsFastaText]);

  const scrollAlignmentToPercent = scrollPercentage => {
    const scrollPercentageToUse = Math.min(Math.max(scrollPercentage, 0), 1);
    easyStore.current.percentScrolled = scrollPercentageToUse;
    alignmentHolder.current.scrollLeft =
      scrollPercentageToUse *
      (alignmentHolder.current.scrollWidth -
        alignmentHolder.current.clientWidth);
    if (alignmentHolderTop.current) {
      alignmentHolderTop.current.scrollLeft =
        scrollPercentageToUse *
        (alignmentHolderTop.current.scrollWidth -
          alignmentHolderTop.current.clientWidth);
    }
  };

  useEffect(() => {
    window.scrollAlignmentToPercent = scrollAlignmentToPercent;
    if (window.Cypress)
      window.Cypress.scrollAlignmentToPercent = scrollAlignmentToPercent;

    return () => {
      delete window.scrollAlignmentToPercent;
      if (window.Cypress) delete window.Cypress.scrollAlignmentToPercent;
    };
  }, []);

  const maxLength = useMemo(() => {
    const { sequenceData = { sequence: "" }, alignmentData } =
      alignmentTracks[0];
    const data = alignmentData || sequenceData;
    return data.noSequence ? data.size : data.sequence.length;
  }, [alignmentTracks]);

  const getSequenceLength = useCallback(() => {
    return alignmentTracks?.[0]?.alignmentData?.sequence?.length || 1;
  }, [alignmentTracks]);

  const getMinCharWidth = useCallback(
    noNameDiv => {
      const toReturn = Math.min(
        Math.max(width - (noNameDiv ? 0 : nameDivWidth) - 5, 1) /
          getSequenceLength(),
        10
      );
      if (isNaN(toReturn)) return 10;
      return toReturn;
    },
    [getSequenceLength, nameDivWidth, width]
  );

  const charWidth = useMemo(() => {
    if (isFullyZoomedOut) {
      return getMinCharWidth();
    } else {
      return Math.max(getMinCharWidth(), charWidthInLinearView);
    }
  }, [charWidthInLinearView, getMinCharWidth, isFullyZoomedOut]);

  const debouncedAlignmentRunUpdate = debounce(alignmentRunUpdate, 1000);

  const caretPositionUpdate = useCallback(
    position => {
      if ((caretPosition || -1) === position) {
        return;
      }
      easyStore.current.caretPosition = position;
      easyStore.current.selectionLayer = { start: -1, end: -1 };
      debouncedAlignmentRunUpdate({
        alignmentId,
        selectionLayer: { start: -1, end: -1 },
        caretPosition: position
      });
    },
    [alignmentId, caretPosition, debouncedAlignmentRunUpdate]
  );

  const selectionLayerUpdate = useCallback(
    (newSelection, { forceReduxUpdate } = {}) => {
      const usableSelectionLayer = selectionLayer || { start: -1, end: -1 };
      if (!newSelection) return;
      const { start, end } = newSelection;

      if (
        usableSelectionLayer.start === start &&
        usableSelectionLayer.end === end
      ) {
        return;
      }
      easyStore.current.caretPosition = -1;
      easyStore.current.selectionLayer = newSelection;

      (forceReduxUpdate ? alignmentRunUpdate : debouncedAlignmentRunUpdate)({
        alignmentId,
        selectionLayer: newSelection,
        caretPosition: -1
      });
    },
    [
      alignmentId,
      alignmentRunUpdate,
      debouncedAlignmentRunUpdate,
      selectionLayer
    ]
  );

  const updateSelectionOrCaret = useCallback(
    (shiftHeld, newRangeOrCaret, { forceReduxUpdate } = {}) => {
      const forceReduxSelectionLayerUpdate = newSelection => {
        selectionLayerUpdate(newSelection, { forceReduxUpdate: true });
      };

      const sequenceLength = getSequenceLength();

      _updateSelectionOrCaret({
        doNotWrapOrigin: true,
        shiftHeld,
        sequenceLength,
        newRangeOrCaret,
        caretPosition: easyStore.current.caretPosition,
        selectionLayer: easyStore.current.selectionLayer,
        selectionLayerUpdate: forceReduxUpdate
          ? forceReduxSelectionLayerUpdate
          : selectionLayerUpdate,
        caretPositionUpdate
      });
    },
    [caretPositionUpdate, getSequenceLength, selectionLayerUpdate]
  );

  const getNearestCursorPositionToMouseEvent = useCallback(
    (_, event, callback) => {
      //loop through all the rendered rows to see if the click event lands in one of them
      let nearestCaretPos = 0;
      const rowDomNode = veTracksAndAlignmentHolder.current;
      const boundingRowRect = rowDomNode.getBoundingClientRect();
      if (getClientX(event) - boundingRowRect.left - nameDivWidth < 0) {
        nearestCaretPos = 0;
      } else {
        const clickXPositionRelativeToRowContainer =
          getClientX(event) - boundingRowRect.left - nameDivWidth;
        const numberOfBPsInFromRowStart = Math.floor(
          (clickXPositionRelativeToRowContainer + charWidth / 2) / charWidth
        );
        nearestCaretPos = numberOfBPsInFromRowStart + 0;
        if (nearestCaretPos > maxLength + 1) {
          nearestCaretPos = maxLength + 1;
        }
      }
      if (sequenceData?.isProtein) {
        nearestCaretPos = Math.round(nearestCaretPos / 3) * 3;
      }
      if (sequenceLength === 0) nearestCaretPos = 0;
      const callbackVals = {
        updateSelectionOrCaret,
        nearestCaretPos,
        sequenceLength: getSequenceLength(),
        caretPosition: easyStore.current.caretPosition,
        selectionLayer: easyStore.current.selectionLayer,
        easyStore: easyStore.current,
        caretPositionUpdate,
        selectionLayerUpdate,
        event,
        doNotWrapOrigin: true,
        shiftHeld: event.shiftKey,
        // caretGrabbed: event.target.className === "cursor",
        selectionStartGrabbed: event.target.classList.contains(
          draggableClassnames.selectionStart
        ),
        selectionEndGrabbed: event.target.classList.contains(
          draggableClassnames.selectionEnd
        )
      };
      callback(callbackVals);
    },
    [
      caretPositionUpdate,
      charWidth,
      getSequenceLength,
      maxLength,
      nameDivWidth,
      selectionLayerUpdate,
      sequenceData?.isProtein,
      sequenceLength,
      updateSelectionOrCaret
    ]
  );

  useEffect(() => {
    const updateAlignmentSelection = newRangeOrCaret => {
      updateSelectionOrCaret(false, newRangeOrCaret, {
        forceReduxUpdate: true
      });
    };
    window.updateAlignmentSelection = updateAlignmentSelection;
    if (window.Cypress)
      window.Cypress.updateAlignmentSelection = updateAlignmentSelection;
    return () => {
      delete window.updateAlignmentSelection;
      if (window.Cypress) {
        delete window.Cypress.updateAlignmentSelection;
      }
    };
  }, [updateSelectionOrCaret]);

  const setVerticalScrollRange = throttle(() => {
    if (
      InfiniteScroller.current &&
      InfiniteScroller.current.getFractionalVisibleRange &&
      easyStore.current
    ) {
      let [start, end] = InfiniteScroller.current.getFractionalVisibleRange();
      if (hasTemplate) {
        end = end + 1;
      }
      if (
        easyStore.current.verticalVisibleRange.start !== start ||
        easyStore.current.verticalVisibleRange.end !== end
      )
        easyStore.current.verticalVisibleRange = { start, end };
    }
  }, 100);

  useEffect(() => {
    setTimeout(() => {
      updateLabelsForInViewFeatures({ rectElement: ".alignmentHolder" });
    }, 0);
    setTimeout(() => {
      setVerticalScrollRange();
    }, 500);
  });

  useEffect(() => {
    if (scrollPercentageToJumpTo !== undefined) {
      scrollAlignmentToPercent(scrollPercentageToJumpTo);
    }
  }, [scrollPercentageToJumpTo]);

  useEffect(() => {
    const saveAlignment = async () => {
      //autosave if necessary!
      if (shouldAutosave && stateTrackingId) {
        setSaveMessage("Alignment Saving..");
        setSaveMessageLoading(true);

        let cleanedTracks;
        if (pairwiseAlignments) {
          cleanedTracks = pairwiseAlignments.map(cleanTracks);
        } else {
          cleanedTracks = cleanTracks(alignmentTracks);
        }

        await handleAlignmentSave(cleanedTracks);
        setSaveMessage("Alignment Saved");
        setSaveMessageLoading(false);
        setTimeout(() => {
          setSaveMessage(undefined);
          setSaveMessageLoading(false);
        }, 5000);
      }
    };
    saveAlignment();
  }, [
    alignmentTracks,
    handleAlignmentSave,
    pairwiseAlignments,
    shouldAutosave,
    stateTrackingId
  ]);

  const annotationClicked = ({
    event,
    annotation,
    gapsBefore = 0,
    gapsInside = 0
  }) => {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();
    updateSelectionOrCaret(event.shiftKey, {
      ...annotation,
      start: annotation.start + gapsBefore,
      end: annotation.end + gapsBefore + gapsInside
    });
  };

  const getNumBpsShownInLinearView = () => {
    const toReturn = (width - nameDivWidth) / charWidth;
    return toReturn || 0;
  };

  const handleScroll = () => {
    if (
      alignmentHolder.current.scrollTop !== oldAlignmentHolderScrollTop.current
    ) {
      setTimeout(() => {
        setVerticalScrollRange();
        oldAlignmentHolderScrollTop.current = alignmentHolder.current.scrollTop;
      }, 100);
    }
    if (blockScroll.current) {
      //we have to block the scroll sometimes when adjusting the minimap so things aren't too jumpy
      return;
    }

    const scrollPercentage =
      alignmentHolder.current.scrollLeft /
      (alignmentHolder.current.scrollWidth -
        alignmentHolder.current.clientWidth);
    easyStore.current.percentScrolled = scrollPercentage || 0;
    if (!isZooming.current) {
      easyStore.current.percentScrolledPreZoom =
        easyStore.current.percentScrolled;
    }
    if (alignmentHolderTop.current) {
      alignmentHolderTop.current.scrollLeft =
        alignmentHolder.current.scrollLeft;
    }
    updateLabelsForInViewFeatures({ rectElement: ".alignmentHolder" });
  };

  const handleTopScroll = () => {
    alignmentHolder.current.scrollLeft = alignmentHolderTop.current.scrollLeft;
  };

  /**
   * Responsible for handling resizing the highlighted region of the minimap
   * @param {*} newSliderSize
   * @param {*} newPercent
   */
  const onMinimapSizeAdjust = (newSliderSize, newPercent) => {
    const percentageOfSpace = newSliderSize / width;
    const seqLength = getSequenceLength();
    const numBpsInView = seqLength * percentageOfSpace;
    const newCharWidth = (width - nameDivWidth) / numBpsInView;
    blockScroll.current = true;
    setCharWidthInLinearView({ charWidthInLinearView: newCharWidth });
    setTimeout(() => {
      scrollAlignmentToPercent(newPercent);
      blockScroll.current = false;
      updateLabelsForInViewFeatures({ rectElement: ".alignmentHolder" });
    });
  };

  const setCharWidthInLinearView = ({ charWidthInLinearView }) => {
    window.localStorage.setItem(
      "charWidthInLinearViewDefault",
      charWidthInLinearView
    );
    _setCharWidthInLinearView(charWidthInLinearView);
    charWidthInLinearViewDefault = JSON.parse(
      window.localStorage.getItem("charWidthInLinearViewDefault")
    );
  };

  const scrollToCaret = () => {
    let el = window.document.querySelector(".veCaret:not(.zoomSelection)"); //adding .veRowViewCaret breaks this for some reason
    if (!el) {
      el = window.document.querySelector(".veCaret"); //adding .veRowViewCaret breaks this for some reason
    }
    if (!el) {
      return;
    }
    el.scrollIntoView({ inline: "center", block: "nearest" });
  };

  const scrollYToTrack = trackIndex => {
    InfiniteScroller.current.scrollTo(trackIndex);
  };

  const estimateRowHeight = (index, cache) => {
    const track = alignmentTracks[index];
    if (!track) return 100;
    const { sequenceData } = track;
    rowData.current = prepareRowData(
      sequenceData,
      sequenceData.sequence.length
    );
    return _estimateRowHeight({
      index,
      cache,
      row: rowData.current[index],
      annotationVisibility:
        alignmentVisibilityToolOptions.alignmentAnnotationVisibility,
      annotationLabelVisibility:
        alignmentVisibilityToolOptions.alignmentAnnotationLabelVisibility
    });
  };

  const renderItem = (_i, key, isTemplate, cloneProps) => {
    const isDragDisabled = !allowTrackRearrange || isPairwise;
    let i;
    if (isTemplate) {
      i = _i;
    } else if (hasTemplate) {
      i = _i + 1;
    } else {
      i = _i;
    }

    const track = alignmentTracks?.[i];
    if (!track) return null;
    const {
      sequenceData,
      alignmentData,
      isReversed,
      wasTrimmed,
      additionalSelectionLayers,
      chromatogramData
      // mismatches
    } = track;
    const seqLen = maxLength;

    const trimmedRangesToDisplay = getTrimmedRangesToDisplay({
      seqLen,
      trimmedRange: alignmentData?.trimmedRange
    });
    const linearViewWidth =
      (alignmentData || sequenceData).sequence.length * charWidth;
    const name = sequenceData.name || sequenceData.id;

    const tickSpacing = massageTickSpacing(Math.ceil(120 / charWidth));

    const { compactNames } =
      alignmentVisibilityToolOptions.alignmentAnnotationVisibility;
    const selectionLayer = [
      tempTrimBefore[i] || trimmedRangesToDisplay[0],
      tempTrimAfter[i] || trimmedRangesToDisplay[1]
    ]
      .filter(i => i)
      .map(i => ({
        ...i,
        hideCarets: true,
        ignoreGaps: true,
        className: "tg-trimmed-region",
        color: "gray"
      }));
    const innerRenderItem = (provided = {}, snapshot) => (
      <div
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        className={classNames("alignmentViewTrackContainer", {
          isDragDisabled
        })}
        data-alignment-track-index={i}
        style={{
          boxShadow: isTemplate
            ? "red 0px -1px 0px 0px inset, red 0px 1px 0px 0px inset"
            : "0px -1px 0px 0px inset",
          display: "flex",
          ...provided?.draggableProps?.style,
          ...(snapshot?.isDragging && { left: unset })
        }}
        key={i}
      >
        <div
          className="alignmentTrackName"
          style={{
            position: "sticky",
            left: 0,
            zIndex: 10,
            borderBottom: `1px solid ${isTemplate ? "red" : "lightgray"}`,
            borderRight: `1px solid ${isTemplate ? "red" : "lightgray"}`,
            width: nameDivWidth - 3,
            padding: 2,
            marginRight: 3,
            paddingBottom: 0,
            minWidth: nameDivWidth - 3,
            overflow: "hidden",
            scrollbarWidth: "none",
            whiteSpace: "nowrap"
          }}
          data-title={name}
          key={i}
        >
          <div
            {...provided?.dragHandleProps}
            style={{
              ...(compactNames && {
                display: "flex",
                alignItems: "flex-start"
              }),
              cursor:
                !isPairwise && allowTrackRearrange && !isTemplate ? "move" : ""
            }}
          >
            <div
              className="alignmentTrackNameDiv"
              style={{
                background: "#3FA6DA",
                display: "inline-block",
                color: "white",
                borderRadius: 5,
                paddingRight: 5,
                ...(compactNames && {
                  marginRight: 5
                })
              }}
            >
              {allowTrackNameEdit && (
                <Button
                  onClick={() => {
                    showDialog({
                      ModalComponent: EditTrackNameDialog,
                      props: {
                        initialValues: {
                          name
                        },
                        updateName: ({ newName }) => {
                          updateTrackHelper({
                            currentPairwiseAlignmentIndex,
                            pairwiseAlignments,
                            upsertAlignmentRun,
                            alignmentId,
                            alignmentTracks: alignmentTracks || [],
                            alignmentTrackIndex: i,
                            update: { name: newName }
                          });
                        }
                      }
                    });
                  }}
                  small
                  data-tip="Edit Track Name"
                  className="edit-track-name-btn"
                  icon={<Icon size={12} color="lightgrey" icon="edit" />}
                  minimal
                />
              )}
              {sequenceData.seqLink && (
                <AnchorButton
                  href={sequenceData.seqLink}
                  data-tip={sequenceData.seqLinkTooltip}
                  target="_blank"
                  small
                  icon={<Icon size={12} color="white" icon="document-open" />}
                  minimal
                />
              )}
              {name}
            </div>
            <div style={{ fontSize: 10, marginTop: 2, marginBottom: 2 }}>
              {isReversed && (
                <span
                  style={{
                    backgroundColor: isReversed ? "#E76A6E" : "#4C90F0",
                    padding: 2,
                    paddingLeft: 4,
                    color: "white",
                    marginRight: 2,
                    borderRadius: "5px"
                  }}
                  data-tip={
                    isReversed
                      ? "The alignment algorithm matched the reverse complement of this input sequence"
                      : "The original sequence was NOT reversed complemented by the alignment algorithm"
                  }
                >
                  {isReversed ? "REV" : "FWD"}{" "}
                </span>
              )}
              {wasTrimmed && (
                <span
                  style={{
                    backgroundColor: "#13C9BA",
                    padding: 2,
                    paddingLeft: 4,
                    color: "white",
                    marginRight: 2,
                    borderRadius: "5px"
                  }}
                  data-tip="This sequence was trimmed and resubmitted for alignment"
                >
                  TRIMMED
                </span>
              )}
              {sequenceData.sequence.length} bps
            </div>
          </div>
          <HorizontalPanelDragHandle
            onDrag={({ dx }) => {
              setNameDivWidth(Math.min(nameDivWidth - dx, width - 20));
            }}
          />
        </div>

        {handleSelectTrack && !isTemplate && (
          <div
            onClick={() => {
              handleSelectTrack(i);
            }}
            style={{
              position: "absolute",
              opacity: 0,
              height: "100%",
              left: nameDivWidth,
              width: linearViewWidth,
              fontWeight: "bolder",
              cursor: "pointer",
              padding: 5,
              textAlign: "center",
              zIndex: 400
            }}
            className="alignmentViewSelectTrackPopover veWhiteBackground"
          >
            Inspect track
          </div>
        )}
        <NonReduxEnhancedLinearView
          {...rest}
          caretPosition={tempTrimmingCaret[i] || -1}
          selectionLayer={selectionLayer}
          isInAlignment
          annotationVisibilityOverrides={
            alignmentVisibilityToolOptions.alignmentAnnotationVisibility
          }
          linearViewAnnotationLabelVisibilityOverrides={
            alignmentVisibilityToolOptions.alignmentAnnotationLabelVisibility
          }
          marginWith={0}
          orfClicked={annotationClicked}
          primerClicked={annotationClicked}
          translationClicked={annotationClicked}
          cutsiteClicked={annotationClicked}
          translationDoubleClicked={annotationClicked}
          deletionLayerClicked={annotationClicked}
          replacementLayerClicked={annotationClicked}
          featureClicked={annotationClicked}
          partClicked={annotationClicked}
          searchLayerClicked={annotationClicked}
          editorDragStarted={noop} //override these since we're defining the handlers above
          editorDragStopped={noop} //override these since we're defining the handlers above
          editorDragged={noop} //override these since we're defining the handlers above
          hideName
          sequenceData={sequenceData}
          tickSpacing={tickSpacing}
          allowSeqDataOverride //override the sequence data stored in redux so we can track the caret position/selection layer in redux but not have to update the redux editor
          editorName={`${isTemplate ? "template_" : ""}alignmentView${i}`}
          alignmentData={alignmentData}
          chromatogramData={chromatogramData}
          height={"100%"}
          vectorInteractionWrapperStyle={{
            overflowY: "hidden"
          }}
          withZoomLinearView={false}
          marginWidth={0}
          linearViewCharWidth={charWidth}
          ignoreGapsOnHighlight
          {...(linearViewOptions &&
            (isFunction(linearViewOptions)
              ? linearViewOptions({
                  index: i,
                  isTemplate,
                  alignmentVisibilityToolOptions,
                  sequenceData,
                  alignmentData,
                  chromatogramData
                })
              : linearViewOptions))}
          additionalSelectionLayers={additionalSelectionLayers}
          dimensions={{
            width: linearViewWidth
          }}
          width={linearViewWidth}
          paddingBottom={5}
          scrollDataPassed={easyStore.current}
        />
      </div>
    );
    if (isTemplate) return innerRenderItem();
    if (cloneProps)
      return innerRenderItem(cloneProps.provided, cloneProps.snapshot);
    const idToUse = alignmentData.id || sequenceData.id || i + "_index_id";
    return (
      <DndDraggable
        key={idToUse.toString()}
        index={i}
        isDragDisabled={isDragDisabled}
        draggableId={idToUse.toString()}
      >
        {innerRenderItem}
      </DndDraggable>
    );
  };

  const handleResize = throttle(([e]) => {
    easyStore.current.viewportWidth = e.contentRect.width - nameDivWidth || 400;
    setWidth(e.contentRect.width);
  }, 200);

  const removeMinimapHighlightForMouseLeave = () => {
    const minimapLaneEl = document.querySelector(`.minimapLane.lane-hovered`);
    if (!minimapLaneEl) return;
    minimapLaneEl.classList.remove("lane-hovered");
  };

  const updateMinimapHighlightForMouseMove = event => {
    latestMouseY.current = getClientY(event); //we use this variable later
    updateMinimapHighlight();
  };

  const updateMinimapHighlight = () => {
    const rows = document.querySelectorAll(`.alignmentViewTrackContainer`);
    const rowsLength = document.querySelectorAll(`.minimapLane`).length;
    if (rowsLength <= 4) {
      return; // no need to include this functionality here
    }
    some(rows, rowDomNode => {
      const boundingRowRect = rowDomNode.getBoundingClientRect();
      if (
        latestMouseY.current > boundingRowRect.top &&
        latestMouseY.current < boundingRowRect.top + boundingRowRect.height
      ) {
        const prevMinimapLaneEl = document.querySelector(
          `.minimapLane.lane-hovered`
        );
        if (prevMinimapLaneEl) {
          prevMinimapLaneEl.classList.remove("lane-hovered");
        }
        const i = Number(rowDomNode.getAttribute("data-alignment-track-index"));

        //then the click falls within this row
        const minimapLaneEl = document.querySelector(
          `.minimapLane:nth-child(${i + 1})`
        );
        if (!minimapLaneEl) return;
        minimapLaneEl.classList.add("lane-hovered");
        return true; //break the loop early because we found the row the click event landed in
      }
    });
  };

  const onTrackDragStart = () => {
    setIsTrackDragging(true);
  };

  const onTrackDragEnd = ({ destination, source }) => {
    setIsTrackDragging(false);
    if (!destination) {
      return;
    }
    upsertAlignmentRun({
      id: alignmentId,
      alignmentTracks: array_move(
        alignmentTracks,
        source.index,
        destination.index
      )
    });
  };

  const getTrackTrimmingOptions = ({
    e,
    allTracks,
    upsertAlignmentRun,
    currentPairwiseAlignmentIndex,
    alignmentId
  }) => {
    const track = getTrackFromEvent(e, allTracks);

    getNearestCursorPositionToMouseEvent(
      rowData.current,
      e,
      ({ nearestCaretPos }) => {
        setTempTrimmingCaret(prev => ({
          ...prev,
          [track.index]: nearestCaretPos
        }));
        const afterDisabled =
          nearestCaretPos <= track.alignmentData.trimmedRange?.start;
        const beforeDisabled =
          nearestCaretPos > track.alignmentData.trimmedRange?.end;
        showContextMenu(
          [
            {
              divider: (
                <div
                  style={{
                    color: "#137cbd",
                    fontSize: 13,
                    fontWeight: "bold"
                  }}
                >{`Trim ${
                  track.sequenceData.name || track.sequenceData.id
                }...`}</div>
              )
            },
            {
              text: "Ignore Before",
              disabled: beforeDisabled,
              icon: "drawer-left-filled",
              onMouseOver: () =>
                !beforeDisabled &&
                setTempTrimBefore(prev => ({
                  ...prev,
                  [track.index]: { start: 0, end: nearestCaretPos - 1 }
                })),
              onMouseLeave: () =>
                setTempTrimBefore(prev => ({
                  ...prev,
                  [track.index]: undefined
                })),
              onClick: () => {
                updateTrackHelper({
                  currentPairwiseAlignmentIndex,
                  upsertAlignmentRun,
                  alignmentId,
                  alignmentTracks: allTracks,
                  alignmentTrackIndex: track.index,
                  hasBeenTrimmed: true,
                  update: {
                    trimmedRange: {
                      start: nearestCaretPos,
                      end:
                        track.alignmentData.trimmedRange?.end || maxLength - 1
                    }
                  }
                });
              }
            },
            {
              text: "Ignore After",
              disabled: afterDisabled,
              icon: "drawer-right-filled",
              onMouseOver: () =>
                !afterDisabled &&
                setTempTrimAfter(prev => ({
                  ...prev,
                  [track.index]: { start: nearestCaretPos, end: maxLength - 1 }
                })),
              onMouseLeave: () =>
                setTempTrimAfter(prev => ({
                  ...prev,
                  [track.index]: undefined
                })),
              onClick: () => {
                updateTrackHelper({
                  currentPairwiseAlignmentIndex,
                  upsertAlignmentRun,
                  alignmentId,
                  alignmentTracks: allTracks,
                  alignmentTrackIndex: track.index,
                  hasBeenTrimmed: true,
                  update: {
                    trimmedRange: {
                      start: track.alignmentData.trimmedRange?.start || 0,
                      end: nearestCaretPos - 1
                    }
                  }
                });
              }
            },
            {
              divider: ""
            },
            {
              text: "Clear Trim(s)",
              disabled: !(track?.alignmentData?.trimmedRange?.start > -1),
              icon: "trash",
              onClick: () => {
                updateTrackHelper({
                  currentPairwiseAlignmentIndex,
                  upsertAlignmentRun,
                  alignmentId,
                  alignmentTracks: allTracks,
                  alignmentTrackIndex: track.index,
                  hasBeenTrimmed: false,
                  update: {
                    trimmedRange: undefined
                  }
                });
              }
            }
          ],
          undefined,
          e,
          () => {
            setTempTrimAfter(prev => ({ ...prev, [track.index]: undefined }));
          }
        );
      }
    );
    e.preventDefault();
    e.stopPropagation();
  };

  if (
    !alignmentTracks ||
    !alignmentTracks[0] ||
    !alignmentTracks[0].alignmentData
  ) {
    console.error("corrupted data!", props);
    return "corrupted data!";
  }

  const getTrackVis = (alignmentTracks, isTemplate, allTracks) => {
    const rowData = {};
    const innerTrackVis = (drop_provided, drop_snapshot) => {
      return (
        <div
          className="alignmentTracks "
          style={{
            overflowY: "auto",
            display: "flex",
            zIndex: 10
          }}
        >
          <div
            style={{ overflowX: "auto", width }}
            ref={ref => {
              if (isTemplate) {
                alignmentHolderTop.current = ref;
              } else {
                alignmentHolder.current = ref;
              }
            }}
            onContextMenu={e => {
              if (
                !allowTrimming ||
                isTargetWithinEl(e, ".alignmentTrackName")
              ) {
                return;
              }

              getTrackTrimmingOptions({
                e,
                allTracks,
                upsertAlignmentRun,
                alignmentId,
                currentPairwiseAlignmentIndex
              });
            }}
            onMouseLeave={removeMinimapHighlightForMouseLeave}
            onMouseMove={updateMinimapHighlightForMouseMove}
            dataname="scrollGroup"
            className="alignmentHolder"
            onScroll={isTemplate ? handleTopScroll : handleScroll}
          >
            <ReactDraggable
              disabled={isTrackDragging}
              bounds={{ top: 0, left: 0, right: 0, bottom: 0 }}
              onDrag={
                noClickDragHandlers
                  ? noop
                  : event => {
                      if (isTrackDragging) return;
                      getNearestCursorPositionToMouseEvent(
                        rowData,
                        event,
                        editorDragged
                      );
                    }
              }
              onStart={
                noClickDragHandlers
                  ? noop
                  : event => {
                      if (isTargetWithinEl(event, ".alignmentTrackName")) {
                        setIsTrackDragging(true);
                        return;
                      }
                      if (isTrackDragging) return;
                      getNearestCursorPositionToMouseEvent(
                        rowData,
                        event,
                        editorDragStarted
                      );
                    }
              }
              onStop={
                noClickDragHandlers
                  ? noop
                  : (...args) => {
                      setTimeout(() => {
                        setIsTrackDragging(false);
                      }, 0);
                      editorDragStopped(...args);
                    }
              }
            >
              <div
                ref={veTracksAndAlignmentHolder}
                className={classNames("veTracksAndAlignmentHolder", {
                  isTrackDragging
                })}
                onClick={
                  noClickDragHandlers
                    ? noop
                    : event => {
                        if (isTrackDragging) return;
                        if (isTargetWithinEl(event, ".alignmentTrackName")) {
                          return;
                        }
                        getNearestCursorPositionToMouseEvent(
                          rowData,
                          event,
                          editorClicked
                        );
                      }
                }
              >
                <PerformantSelectionLayer
                  leftMargin={nameDivWidth}
                  className="veAlignmentSelectionLayer"
                  isDraggable
                  selectionLayerRightClicked={
                    selectionLayerRightClicked
                      ? (...args) => {
                          // It's necessary to take the props out of the function
                          // arguments
                          selectionLayerRightClicked(...args, props);
                        }
                      : (...args) => {
                          const { event } = args[0];
                          const track = getTrackFromEvent(event, allTracks);

                          const alignmentData = track.alignmentData;
                          const { name } = alignmentData;

                          const copySpecificAlignmentFasta = async () => {
                            const { selectionLayer } =
                              store.getState().VectorEditor.__allEditorsOptions
                                .alignments[id] || {};
                            const seqDataToCopy = getSequenceDataBetweenRange(
                              alignmentData,
                              selectionLayer
                            ).sequence;
                            const seqDataToCopyAsFasta = `>${name}\r\n${seqDataToCopy}\r\n`;
                            await navigator.clipboard.writeText(
                              seqDataToCopyAsFasta
                            );
                          };

                          const copySpecificAlignment = async () => {
                            const { selectionLayer } =
                              store.getState().VectorEditor.__allEditorsOptions
                                .alignments[id] || {};
                            const seqDataToCopy = getSequenceDataBetweenRange(
                              alignmentData,
                              selectionLayer
                            ).sequence;
                            await navigator.clipboard.writeText(seqDataToCopy);
                          };

                          const getAllAlignmentsFastaText = async () => {
                            await navigator.clipboard.writeText(
                              getAllAlignmentsFastaText()
                            );
                          };

                          showContextMenu(
                            [
                              ...(additionalSelectionLayerRightClickedOptions
                                ? additionalSelectionLayerRightClickedOptions(
                                    ...args,
                                    props
                                  )
                                : []),
                              {
                                text: "Copy Selection of All Alignments as Fasta",
                                className:
                                  "copyAllAlignmentsFastaClipboardHelper",
                                hotkey: "cmd+c",
                                onClick: () => {
                                  getAllAlignmentsFastaText();
                                  window.toastr.success("Selection Copied");
                                }
                              },
                              {
                                text: `Copy Selection of ${name} as Fasta`,
                                className:
                                  "copySpecificAlignmentFastaClipboardHelper",
                                onClick: () => {
                                  copySpecificAlignmentFasta();
                                  window.toastr.success(
                                    "Selection Copied As Fasta"
                                  );
                                }
                              },
                              {
                                text: `Copy Selection of ${name}`,
                                className:
                                  "copySpecificAlignmentAsPlainClipboardHelper",
                                onClick: () => {
                                  copySpecificAlignment();
                                  window.toastr.success("Selection Copied");
                                }
                              }
                            ],
                            undefined,
                            event
                          );
                        }
                  }
                  easyStore={easyStore.current}
                  sequenceLength={maxLength}
                  charWidth={charWidth}
                  row={{ start: 0, end: maxLength - 1 }}
                />
                <PerformantCaret
                  leftMargin={nameDivWidth}
                  className="veAlignmentSelectionLayer"
                  isDraggable
                  sequenceLength={maxLength}
                  charWidth={charWidth}
                  row={{ start: 0, end: maxLength - 1 }}
                  easyStore={easyStore.current}
                />
                {isTemplate ? (
                  renderItem(0, 0, isTemplate)
                ) : (
                  <ReactList
                    ref={c => {
                      InfiniteScroller.current = c;
                      const domNode = ReactDOM.findDOMNode(c);
                      if (domNode instanceof HTMLElement) {
                        drop_provided.innerRef(domNode);
                      }
                    }}
                    type="variable"
                    itemSizeEstimator={estimateRowHeight}
                    itemRenderer={renderItem}
                    length={
                      alignmentTracks.length +
                      (drop_snapshot.isUsingPlaceholder ? 1 : 0)
                    }
                  />
                )}
              </div>
            </ReactDraggable>
          </div>
        </div>
      );
    };
    if (isTemplate) return innerTrackVis();
    else
      return (
        <Droppable
          mode="virtual"
          renderClone={(provided, snapshot, { source: { index } }) => {
            return renderItem(index, index, false, {
              provided,
              snapshot
            });
          }}
          direction="vertical"
          droppableId={"droppable" + isTemplate ? "_no_drop" : ""}
        >
          {innerTrackVis}
        </Droppable>
      );
  };

  const [firstTrack, ...otherTracks] = alignmentTracks;
  const totalWidthOfMinimap = width;
  const totalWidthInAlignmentView = 14 * getSequenceLength();
  const minSliderSize = Math.min(
    totalWidthOfMinimap * (totalWidthOfMinimap / totalWidthInAlignmentView),
    totalWidthOfMinimap
  );
  const viewportHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );

  /**
   * Parameters to be passed to our Pinch Handler component
   * OnPinch is the method to be executed when the pinch gesture is registered
   * Pinch Handler for minimap
   */
  const pinchHandler = {
    onPinch: ({ delta: [d] }) => {
      bindOutsideChangeHelper.current.triggerChange(
        ({ value, changeValue }) => {
          // changeValue(d);
          if (d > 0) {
            if (value > 8) {
              changeValue(value + 0.4);
            } else {
              changeValue(value + 0.2);
            }
          } else if (d < 0) {
            if (value > 8) {
              changeValue(value - 0.4);
            } else {
              changeValue(value - 0.2);
            }
          }
        }
      );
      updateLabelsForInViewFeatures();
    }
  };

  return (
    <PinchHelper {...pinchHandler}>
      <ResizeSensor onResize={handleResize}>
        <div
          style={{
            height: height || (isPairwise ? "auto" : viewportHeight * 0.88),
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflowY: "auto",
            ...style
            // borderTop: "1px solid black"
          }}
          className="alignmentView"
        >
          <DragDropContext
            onDragStart={onTrackDragStart}
            onDragEnd={onTrackDragEnd}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflowY: "auto"
              }}
              className="alignmentView-top-container"
            >
              <div
                style={{
                  paddingTop: "3px",
                  paddingBottom: "5px",
                  borderBottom: "1px solid",
                  display: "flex",
                  minHeight: "32px",
                  width: "100%",
                  flexWrap: "nowrap",
                  flexDirection: "row",
                  flex: "0 0 auto"
                }}
                className="ve-alignment-top-bar"
              >
                {additionalTopLeftEl}
                {handleBackButtonClicked && (
                  <Tooltip content="Back to Pairwise Alignment Overview">
                    <Button
                      icon="arrow-left"
                      onClick={() => {
                        handleBackButtonClicked();
                        caretPositionUpdate(-1);
                      }}
                      small
                      intent={Intent.PRIMARY}
                      minimal
                      style={{ marginRight: 10 }}
                      className="alignmentViewBackButton"
                    />
                  </Tooltip>
                )}

                <div style={{ display: "flex" }}>
                  <EditableText
                    disabled={!handleAlignmentRename}
                    onChange={v => {
                      setAlignmentName(v);
                    }}
                    maxLength={399} //stop the name from being tooo long
                    value={alignmentName}
                    onConfirm={async v => {
                      if (!v) {
                        setAlignmentName(_alignmentName);
                        return;
                      }
                      if (v === _alignmentName) {
                        return; //already saved this name
                      }
                      setSaveMessage("Alignment Renaming..");
                      setSaveMessageLoading(true);
                      await handleAlignmentRename(v, props);
                      setSaveMessage("Rename Successful");
                      setSaveMessageLoading(false);
                      setTimeout(() => {
                        setSaveMessage(undefined);
                        setSaveMessageLoading(false);
                      }, 5000);
                    }}
                    selectAllOnFocus={true}
                    className="veAlignmentName"
                  />
                  &nbsp;&nbsp;&nbsp;
                  <div
                    className="veAlignmentType"
                    style={{
                      paddingTop: "3px",
                      fontSize: "14px",
                      color: "grey",
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                    data-title={alignmentType || "Unknown Alignment Type"}
                  >
                    {alignmentType || "Unknown Alignment Type"}
                  </div>
                </div>

                {unmappedSeqs && (
                  <InfoHelper
                    size={20}
                    content={
                      <div>
                        This alignment had sequences that did not map to the
                        template sequence:
                        {unmappedSeqs.map(({ sequenceData }, i) => (
                          <div key={i}>{sequenceData.name}</div>
                        ))}
                      </div>
                    }
                    intent="warning"
                    icon="warning-sign"
                  />
                )}
                {!isInPairwiseOverviewView && (
                  <UncontrolledSliderWithPlusMinusBtns
                    noWraparound
                    bindOutsideChangeHelper={bindOutsideChangeHelper.current}
                    onClick={() => {
                      setTimeout(scrollToCaret, 0);
                    }}
                    minCharWidth={getMinCharWidth()}
                    onChange={async zoomLvl => {
                      isZooming.current = true;
                      setTimeout(() => {
                        isZooming.current = false;
                      }, 10);
                      // zoomLvl is in the range of 0 to 10
                      const minCharWidth = getMinCharWidth();
                      const scaleFactor = Math.pow(12 / minCharWidth, 1 / 10);
                      const newCharWidth =
                        minCharWidth * Math.pow(scaleFactor, zoomLvl);
                      await setCharWidthInLinearView({
                        charWidthInLinearView: newCharWidth
                      });
                      await scrollToCaret();
                      await updateLabelsForInViewFeatures({
                        rectElement: ".alignmentHolder"
                      });
                    }}
                    coerceInitialValue={coerceInitialValue}
                    title="Adjust Zoom Level"
                    style={{ paddingTop: "4px", width: 100 }}
                    className="veZoomAlignmentSlider ove-slider"
                    labelRenderer={false}
                    initialValue={charWidth}
                    stepSize={0.05} //was 0.01
                    max={10}
                    min={0}
                    clickStepSize={0.5}
                  />
                )}
                {!noVisibilityOptions && !isInPairwiseOverviewView && (
                  <AlignmentVisibilityTool
                    currentPairwiseAlignmentIndex={
                      currentPairwiseAlignmentIndex
                    }
                    {...alignmentVisibilityToolOptions}
                  />
                )}
                {updateAlignmentSortOrder && !isInPairwiseOverviewView && (
                  <Popover
                    minimal
                    content={
                      <Menu>
                        <MenuItem
                          active={true || alignmentSortOrder}
                          onClick={() => {
                            updateAlignmentSortOrder("Position");
                          }}
                          text="Position"
                        />
                        <MenuItem
                          active={false || alignmentSortOrder}
                          onClick={() => {
                            updateAlignmentSortOrder("Alphabetical");
                          }}
                          text="Alphabetical"
                        />
                      </Menu>
                    }
                    target={
                      <Button
                        small
                        text="Sort Order"
                        rightIcon="caret-down"
                        icon="sort"
                      />
                    }
                  />
                )}
                {additionalTopEl}
                {saveMessage && (
                  <div
                    className="ove-menu-toast"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "auto",
                      marginRight: 10
                    }}
                  >
                    {saveMessageLoading ? (
                      <div>
                        <Spinner size={15}></Spinner>
                      </div>
                    ) : (
                      <Icon icon="tick-circle" intent="success"></Icon>
                    )}{" "}
                    &nbsp;
                    {saveMessage}
                  </div>
                )}
              </div>
              {hasTemplate ? (
                <>
                  <div className="alignmentTrackFixedToTop">
                    {getTrackVis([firstTrack], true, alignmentTracks)}
                  </div>
                  {getTrackVis(otherTracks, false, alignmentTracks)}
                </>
              ) : (
                getTrackVis(alignmentTracks, false, alignmentTracks)
              )}
            </div>
          </DragDropContext>
          {!isInPairwiseOverviewView && (
            <div
              className="alignmentViewBottomBar"
              style={{
                // flexGrow: 1,
                // minHeight: "-webkit-min-content", //https://stackoverflow.com/questions/28029736/how-to-prevent-a-flex-item-from-shrinking-smaller-than-its-content
                maxHeight: 210,
                marginTop: 4,
                paddingTop: 4,
                borderTop: "1px solid lightgrey",
                display: "flex"
              }}
            >
              <Minimap
                selectionLayerComp={
                  <>
                    <PerformantSelectionLayer
                      is
                      hideCarets
                      className="veAlignmentSelectionLayer veMinimapSelectionLayer"
                      easyStore={easyStore.current}
                      sequenceLength={maxLength}
                      charWidth={getMinCharWidth(true)}
                      row={{ start: 0, end: maxLength - 1 }}
                    />
                    <PerformantCaret
                      style={{
                        opacity: 0.2
                      }}
                      className="veAlignmentSelectionLayer veMinimapSelectionLayer"
                      sequenceLength={maxLength}
                      charWidth={getMinCharWidth(true)}
                      row={{ start: 0, end: maxLength - 1 }}
                      easyStore={easyStore.current}
                    />
                  </>
                }
                alignmentTracks={alignmentTracks}
                dimensions={{
                  width: Math.max(width, 10) || 10
                }}
                nameDivOffsetPercent={0}
                scrollYToTrack={scrollYToTrack}
                onSizeAdjust={onMinimapSizeAdjust}
                minSliderSize={minSliderSize}
                laneHeight={
                  minimapLaneHeight || (alignmentTracks.length > 5 ? 10 : 17)
                }
                laneSpacing={
                  minimapLaneSpacing || (alignmentTracks.length > 5 ? 2 : 1)
                }
                easyStore={easyStore.current}
                numBpsShownInLinearView={getNumBpsShownInLinearView()}
                scrollAlignmentView={false}
                onMinimapScrollX={scrollAlignmentToPercent}
              />
            </div>
          )}
          <GlobalDialog
          // {...pickedUserDefinedHandlersAndOpts}
          // dialogOverrides={pick(this.props, [
          //   "AddOrEditFeatureDialogOverride",
          //   "AddOrEditPartDialogOverride",
          //   "AddOrEditPrimerDialogOverride"
          // ])}
          />
        </div>
      </ResizeSensor>
    </PinchHelper>
  );
};

export default compose(
  withStore,
  withEditorProps,
  connect(
    (state, ownProps) => {
      // const {id}
      const {
        VectorEditor: {
          __allEditorsOptions: { alignments }
        }
      } = state;
      const { id: alignmentId, updateAlignmentViewVisibility } = ownProps;
      const alignment = { ...alignments[alignmentId], id: alignmentId };
      const {
        stateTrackingId,
        unmappedSeqs,
        alignmentTracks,
        pairwiseAlignments,
        alignmentType,
        scrollPercentageToJumpTo,
        pairwiseOverviewAlignmentTracks,
        loading,
        name,
        alignmentAnnotationVisibility,
        alignmentAnnotationLabelVisibility,
        caretPosition = -1,
        selectionLayer = { start: -1, end: -1 }
      } = alignment || {};
      if (loading) {
        return {
          loading: true
        };
      }
      if (!alignmentTracks && !pairwiseAlignments)
        return {
          noTracks: true
        };
      const templateLength = (
        pairwiseAlignments ? pairwiseAlignments[0][0] : alignmentTracks[0]
      ).alignmentData.sequence.length;

      const alignmentAnnotationsToToggle = [
        "features",
        "parts",
        "sequence",
        "reverseSequence",
        "axis",
        "translations",
        "cdsFeatureTranslations",
        "chromatogram",
        "dnaColors",
        "compactNames"
      ];
      const togglableAlignmentAnnotationSettings = {};
      map(alignmentAnnotationsToToggle, annotation => {
        if (annotation in alignmentAnnotationVisibility) {
          togglableAlignmentAnnotationSettings[annotation] =
            alignmentAnnotationVisibility[annotation];
        }
      });

      const annotationsWithCounts = [];
      if (alignmentTracks) {
        let totalNumOfFeatures = 0;
        let totalNumOfParts = 0;
        alignmentTracks.forEach(seq => {
          if (seq.sequenceData.features) {
            totalNumOfFeatures += seq.sequenceData.features.length;
          }
          if (seq.sequenceData.parts) {
            totalNumOfParts += seq.sequenceData.parts.length;
          }
        });
        annotationsWithCounts.push({
          features: totalNumOfFeatures,
          parts: totalNumOfParts
        });
      } else if (pairwiseAlignments) {
        pairwiseAlignments.forEach(pairwise => {
          let totalNumOfFeatures = 0;
          let totalNumOfParts = 0;
          pairwise.forEach(seq => {
            if (seq.sequenceData.features) {
              totalNumOfFeatures += seq.sequenceData.features.length;
            }
            if (seq.sequenceData.parts) {
              totalNumOfParts += seq.sequenceData.parts.length;
            }
          });
          annotationsWithCounts.push({
            features: totalNumOfFeatures,
            parts: totalNumOfParts
          });
        });
      }

      return {
        isAlignment: true,
        selectionLayer,
        unmappedSeqs,
        caretPosition,
        alignmentId,
        ...(name && { alignmentName: name }),
        stateTrackingId,
        sequenceData: {
          //pass fake seq data in so editor interactions work
          sequence: Array.from(templateLength)
            .map(() => "a")
            .join("")
        },
        pairwiseAlignments,
        alignmentType,
        alignmentTracks,
        scrollPercentageToJumpTo,
        pairwiseOverviewAlignmentTracks,
        //manipulate the props coming in so we can pass a single clean prop to the visibility options tool
        alignmentVisibilityToolOptions: {
          alignmentAnnotationVisibility,
          alignmentAnnotationLabelVisibility,
          alignmentAnnotationVisibilityToggle: updates => {
            setTimeout(() => {
              updateLabelsForInViewFeatures({
                rectElement: ".alignmentHolder"
              });
            }, 0);

            updateAlignmentViewVisibility({
              ...alignment,
              alignmentAnnotationVisibility: {
                ...alignment.alignmentAnnotationVisibility,
                ...updates
              }
            });
          },
          alignmentAnnotationLabelVisibilityToggle: name => {
            updateAlignmentViewVisibility({
              ...alignment,
              alignmentAnnotationLabelVisibility: {
                ...alignment.alignmentAnnotationLabelVisibility,
                [name]: !alignment.alignmentAnnotationLabelVisibility[name]
              }
            });
          },
          togglableAlignmentAnnotationSettings,
          annotationsWithCounts
        }
      };
    },
    {
      ...alignmentActions
    }
  ),
  branch(
    ({ loading }) => loading,
    renderComponent(() => {
      return <Loading bounce />;
    })
  ),
  branch(
    ({ noTracks }) => noTracks,
    renderComponent(() => {
      return (
        <div style={{ minHeight: 30, minWidth: 150 }}>"No Tracks Found"</div>
      );
    })
  ),
  branch(
    ({ pairwiseAlignments }) => pairwiseAlignments,
    renderComponent(props => {
      return <PairwiseAlignmentView {...props} />;
    })
  )
)(AlignmentView);

const PerformantCaret = view(({ easyStore, ...rest }) => {
  return <Caret caretPosition={easyStore.caretPosition} {...rest} />;
});

function cleanTracks(alignmentTracks) {
  return alignmentTracks.map(t => {
    return omit(t, [
      "matchHighlightRanges",
      "additionalSelectionLayers",
      "mismatches"
    ]);
  });
}
