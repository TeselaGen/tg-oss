import { noop, startCase } from "lodash-es";
import draggableClassnames from "../constants/draggableClassnames";
import prepareRowData from "../utils/prepareRowData";
import React, { useCallback, useMemo, useRef, useState } from "react";
import Draggable from "react-draggable";
import RowItem from "../RowItem";
import withEditorInteractions from "../withEditorInteractions";
import { withEditorPropsNoRedux } from "../withEditorProps";
import "./style.css";
import {
  getClientX,
  getEmptyText,
  getParedDownWarning,
  pareDownAnnotations
} from "../utils/editorUtils";
import useAnnotationLimits from "../utils/useAnnotationLimits";
import { SequenceName } from "./SequenceName";
import classNames from "classnames";
import { massageTickSpacing } from "../utils/massageTickSpacing";
import PinchHelper from "../helperComponents/PinchHelper/PinchHelper";
import { updateLabelsForInViewFeatures } from "../utils/updateLabelsForInViewFeatures";
import { VeTopRightContainer } from "../CircularView/VeTopRightContainer";
import { ZoomLinearView } from "./ZoomLinearView";
import {
  editorDragged as _editorDragged,
  editorDragStarted as _editorDragStarted,
  editorDragStopped as _editorDragStopped
} from "../withEditorInteractions/clickAndDragUtils";
import { store } from "@risingstack/react-easy-state";

const defaultMarginWidth = 10;

const _LinearView = props => {
  const {
    updateSelectionOrCaret,
    selectionLayer,
    caretPositionUpdate,
    selectionLayerUpdate,
    limits,
    maxAnnotationsToDisplay,
    editorDragged,
    editorDragStarted,
    editorDragStopped
  } = props;
  const {
    //currently found in props
    sequenceData,
    alignmentData,
    hideName = false,
    editorClicked = noop,
    width = 400,
    className,
    tickSpacing,
    scrollDataPassed,
    caretPosition,
    backgroundRightClicked = noop,
    RowItemProps,
    marginWidth = defaultMarginWidth,
    height,
    isInAlignment,
    withZoomLinearView = false,
    editorName,
    smallSlider,
    paddingBottom,
    linearViewCharWidth,
    annotationVisibilityOverrides,
    isProtein,
    noWarnings,
    ...rest
  } = props;

  const [charWidthInLinearView, setCharWidthInLinearView] = useState();
  const bindOutsideChangeHelper = useRef({});
  const linearView = useRef(null);

  const maxLength = useMemo(() => {
    const data = alignmentData || sequenceData || { sequence: "" };
    return data.noSequence ? data.size : data.sequence.length;
  }, [alignmentData, sequenceData]);

  let innerWidth = Math.max(width - marginWidth - 20, 0);
  if (isNaN(innerWidth)) {
    innerWidth = 0;
  }
  const initialCharWidth = Math.min(innerWidth / maxLength, 20);
  const charWidth =
    charWidthInLinearView || linearViewCharWidth || initialCharWidth;

  const easyStore = useRef(
    store({
      percentScrolled: 0,
      viewportWidth: 400
    })
  );

  const getNearestCursorPositionToMouseEvent = useCallback(
    (event, callback) => {
      //loop through all the rendered rows to see if the click event lands in one of them
      let nearestCaretPos = 0;
      let rowDomNode = linearView.current;
      rowDomNode = rowDomNode.querySelector(".veRowItem");
      const boundingRowRect = rowDomNode.getBoundingClientRect();
      if (getClientX(event) - boundingRowRect.left < 0) {
        nearestCaretPos = 0;
      } else {
        const clickXPositionRelativeToRowContainer =
          getClientX(event) - boundingRowRect.left;
        const numberOfBPsInFromRowStart = Math.floor(
          (clickXPositionRelativeToRowContainer + charWidth / 2) / charWidth
        );
        nearestCaretPos = numberOfBPsInFromRowStart + 0;
        if (nearestCaretPos > maxLength + 1) {
          nearestCaretPos = maxLength + 1;
        }
      }
      if (sequenceData && sequenceData.isProtein) {
        nearestCaretPos = Math.round(nearestCaretPos / 3) * 3;
      }
      if (maxLength === 0) nearestCaretPos = 0;
      const callbackVals = {
        updateSelectionOrCaret,
        caretPosition,
        selectionLayer,
        caretPositionUpdate,
        selectionLayerUpdate,
        sequenceLength: maxLength,
        doNotWrapOrigin: !(sequenceData && sequenceData.circular),
        event,
        shiftHeld: event.shiftKey,
        nearestCaretPos,
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
      caretPosition,
      caretPositionUpdate,
      charWidth,
      maxLength,
      selectionLayer,
      selectionLayerUpdate,
      sequenceData,
      updateSelectionOrCaret
    ]
  );

  const { rowData, paredDownMessages } = useMemo(() => {
    const _paredDownMessages = [];
    const paredDownSeqData = ["parts", "features", "cutsites"].reduce(
      (acc, type) => {
        const nameUpper = startCase(type);
        const maxToShow =
          (maxAnnotationsToDisplay
            ? maxAnnotationsToDisplay[type]
            : limits[type]) || 50;
        const [annotations, paredDown] = pareDownAnnotations(
          sequenceData?.["filtered" + nameUpper] || sequenceData?.[type] || {},
          maxToShow
        );

        if (paredDown) {
          _paredDownMessages.push(
            getParedDownWarning({
              nameUpper,
              isAdjustable: !maxAnnotationsToDisplay,
              maxToShow
            })
          );
        }
        acc[type] = annotations;
        return acc;
      },
      {}
    );
    const _rowData = prepareRowData(
      {
        ...sequenceData,
        ...paredDownSeqData
      },
      sequenceData?.sequence ? sequenceData.sequence.length : 0
    );
    return { rowData: _rowData, paredDownMessages: _paredDownMessages };
  }, [limits, maxAnnotationsToDisplay, sequenceData]);

  const isLinViewZoomed = charWidth !== initialCharWidth;
  const sequenceName = hideName ? "" : sequenceData?.name || "";
  const linearZoomEnabled = maxLength >= 50 && withZoomLinearView;
  const minCharWidth = initialCharWidth;
  const PinchHelperToUse = linearZoomEnabled ? PinchHelper : React.Fragment;

  const pinchHandler = useMemo(
    () => ({
      onPinch: ({ delta: [d] }) => {
        if (d === 0) return;
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
    }),
    []
  );
  const tickSpacingToUse = useMemo(
    () =>
      tickSpacing ||
      (isLinViewZoomed
        ? massageTickSpacing(Math.ceil(120 / charWidth))
        : massageTickSpacing(
            Math.floor(
              (maxLength() / (sequenceData?.isProtein ? 9 : 10)) *
                Math.max(1, Math.log10(1 / charWidth))
            )
          )),
    [
      charWidth,
      isLinViewZoomed,
      maxLength,
      sequenceData?.isProtein,
      tickSpacing
    ]
  );

  return (
    <Draggable
      enableUserSelectHack={false} //needed to prevent the input bubble from losing focus post user drag
      bounds={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDrag={event => {
        getNearestCursorPositionToMouseEvent(
          event,
          editorDragged || _editorDragged
        );
      }}
      onStart={event => {
        getNearestCursorPositionToMouseEvent(
          event,
          editorDragStarted || _editorDragStarted
        );
      }}
      onStop={editorDragStopped || _editorDragStopped}
    >
      <div
        ref={linearView}
        className={classNames("veLinearView", className, {
          isLinViewZoomed
        })}
        style={{
          width,
          ...(height && { height }),
          paddingLeft: marginWidth / 2,
          ...(paddingBottom && { paddingBottom })
        }}
        onContextMenu={event => {
          getNearestCursorPositionToMouseEvent(event, backgroundRightClicked);
        }}
        onClick={event => {
          getNearestCursorPositionToMouseEvent(event, editorClicked);
        }}
      >
        {linearZoomEnabled && ( //so this for conditonal rendering
          <ZoomLinearView
            charWidth={charWidth}
            bindOutsideChangeHelper={bindOutsideChangeHelper.current}
            minCharWidth={minCharWidth}
            smallSlider={smallSlider}
            editorName={editorName}
            setCharWidth={v => {
              setCharWidthInLinearView(v === initialCharWidth ? undefined : v);
            }}
            afterOnChange={() => {
              updateLabelsForInViewFeatures();
            }}
          />
        )}
        {!hideName && (
          <SequenceName
            isProtein={isProtein}
            sequenceName={sequenceName}
            sequenceLength={
              sequenceData?.sequence ? sequenceData.sequence.length : 0
            }
          />
        )}
        {!noWarnings && (
          <VeTopRightContainer>{paredDownMessages}</VeTopRightContainer>
        )}
        <PinchHelperToUse {...(linearZoomEnabled && pinchHandler)}>
          <RowItem
            {...rest}
            editorName={editorName}
            onScroll={() => {
              easyStore.current.viewportWidth = width;
              const row = linearView.current.querySelector(".veRowItemWrapper");
              const scrollPercentage =
                row.scrollLeft / (row.scrollWidth - row.clientWidth);
              easyStore.current.percentScrolled = scrollPercentage;
              updateLabelsForInViewFeatures();
            }}
            rowContainerStyle={{
              height: isNaN(height - 36)
                ? "auto"
                : height - 36 - (hideName ? 0 : 20),
              width: innerWidth + 26,
              paddingRight: marginWidth / 2,
              ...(isLinViewZoomed && !isInAlignment && { paddingBottom: 15 })
            }}
            charWidth={charWidth}
            scrollData={
              scrollDataPassed ||
              (isLinViewZoomed ? easyStore.current : undefined)
            }
            caretPosition={caretPosition}
            isProtein={sequenceData?.isProtein}
            alignmentData={alignmentData}
            sequenceLength={maxLength}
            bpsPerRow={maxLength}
            fullSequence={sequenceData?.sequence}
            emptyText={getEmptyText({ sequenceData, caretPosition })}
            tickSpacing={tickSpacingToUse}
            annotationVisibility={{
              ...rest.annotationVisibility,
              ...((!isLinViewZoomed || charWidth < 5) && {
                translations: false,
                primaryProteinSequence: false,
                reverseSequence: false,
                sequence: false,
                cutsitesInSequence: false
              }),
              ...annotationVisibilityOverrides
            }}
            {...RowItemProps}
            row={rowData[0]}
            isLinearView
          />
        </PinchHelperToUse>
      </div>
    </Draggable>
  );
};

const WithAnnotationLimitsHoc = Component => props => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [limits = {}] = useAnnotationLimits();
  return <Component limits={limits} {...props}></Component>;
};
export const LinearView = WithAnnotationLimitsHoc(_LinearView);

export const NonReduxEnhancedLinearView = withEditorPropsNoRedux(LinearView);

export default withEditorInteractions(LinearView);

export const scrollToCaret = () => {
  const el = window.document.querySelector(".veLinearView .veRowViewCaret");
  if (!el) return;
  el.scrollIntoView({ inline: "center", block: "nearest" });
};
