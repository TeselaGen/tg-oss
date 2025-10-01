// import { onlyUpdateForKeys } from "recompose";
import draggableClassnames from "../../constants/draggableClassnames";
import React from "react";
import Caret from "../Caret";
import { pureNoFunc } from "@teselagen/ui";
import "./style.css";

import getXStartAndWidthOfRangeWrtRow from "../getXStartAndWidthOfRangeWrtRow";
import { getOverlapsOfPotentiallyCircularRanges } from "@teselagen/range-utils";
import {
  getSelectionMessage,
  preventDefaultStopPropagation
} from "../../utils/editorUtils";

function SelectionLayer(props) {
  const {
    charWidth,
    isDraggable,
    row,
    sequenceLength,
    regions,
    leftMargin = 0,
    isProtein,
    getGaps,
    hideTitle: topLevelHideTitle,
    customTitle: topLevelCustomTitle,
    color: topLevelColor,
    hideCarets: topLevelHideCarets = false,
    selectionLayerRightClicked,
    className: globalClassname = "",
    onClick
  } = props;
  let hasSelection = false;

  const toReturn = (
    <React.Fragment>
      {regions.map(function (selectionLayer, topIndex) {
        const _onClick = onClick
          ? function (event) {
              onClick({
                event,
                annotation: selectionLayer
              });
            }
          : undefined;
        const {
          className = "",
          style = {},
          start,
          end,
          color,
          hideTitle,
          customTitle,
          hideCarets = false,
          ignoreGaps,
          height
        } = selectionLayer;
        const selectionMessage =
          hideTitle || topLevelHideTitle
            ? ""
            : getSelectionMessage({
                selectionLayer,
                customTitle: customTitle || topLevelCustomTitle,
                sequenceLength,
                isProtein
              });
        const onSelectionContextMenu = function (event) {
          selectionLayerRightClicked &&
            selectionLayerRightClicked({
              event,
              annotation: selectionLayer
            });
        };

        const classNameToPass = className + " " + globalClassname;
        if (start > -1) {
          const overlaps = getOverlapsOfPotentiallyCircularRanges(
            selectionLayer,
            row,
            sequenceLength
          );
          //DRAW SELECTION LAYER
          if (overlaps.length) hasSelection = true;
          return overlaps.map(function (overlap, index) {
            const key = topIndex + "-" + index;
            let isTrueStart = false;
            let isTrueEnd = false;
            if (overlap.start === selectionLayer.start) {
              isTrueStart = true;
            }
            if (overlap.end === selectionLayer.end) {
              isTrueEnd = true;
            }
            const { xStart, width } = getXStartAndWidthOfRangeWrtRow({
              range: overlap,
              row,
              charWidth,
              sequenceLength,
              ...(ignoreGaps ? {} : getGaps(overlap))
            });
            let caretSvgs = [];
            if (!(hideCarets || topLevelHideCarets)) {
              //DRAW CARETS
              caretSvgs = [
                overlap.start === start && (
                  <Caret
                    key={key + "caret1"}
                    {...{
                      isProtein,
                      leftMargin,
                      onClick: _onClick || preventDefaultStopPropagation,
                      onRightClick: onSelectionContextMenu,
                      charWidth,
                      row,
                      style: selectionLayer.style,
                      getGaps,
                      isDraggable,
                      ignoreGaps,
                      sequenceLength,
                      className:
                        classNameToPass +
                        " selectionLayerCaret " +
                        (isDraggable ? draggableClassnames.selectionStart : ""),
                      caretPosition: overlap.start
                    }}
                  />
                ),
                overlap.end === end && (
                  <Caret
                    key={key + "caret2"}
                    {...{
                      isProtein,
                      leftMargin,
                      onClick: _onClick || preventDefaultStopPropagation,
                      onRightClick: onSelectionContextMenu,
                      charWidth,
                      isDraggable,
                      row,
                      getGaps,
                      style: selectionLayer.style,
                      ignoreGaps,
                      sequenceLength,
                      className:
                        classNameToPass +
                        " selectionLayerCaret " +
                        (isDraggable ? draggableClassnames.selectionEnd : ""),
                      caretPosition: overlap.end + 1
                    }}
                  />
                )
              ];
            }
            // Create base selection layer element
            const selectionElement = (
              <div
                onClick={_onClick}
                title={selectionMessage}
                onContextMenu={onSelectionContextMenu}
                key={key}
                className={
                  classNameToPass +
                  " veSelectionLayer veRowViewSelectionLayer notCaret " +
                  (isTrueStart ? " isTrueStart " : "") +
                  (isTrueEnd ? " isTrueEnd " : "")
                }
                style={{
                  width,
                  left: leftMargin + xStart,
                  ...style,
                  background: color || topLevelColor,
                  height
                }}
              ></div>
            );

            // Generate mismatch sub-regions if mismatchPositions exist
            let mismatchElements = [];
            if (
              selectionLayer.mismatchPositions &&
              selectionLayer.mismatchPositions.length > 0
            ) {
              // Calculate relative mismatch positions within this overlap
              const relativeToOverlap = selectionLayer.mismatchPositions
                .filter(pos => {
                  // Adjust position based on overlap's relation to the original selection layer
                  const absPos = pos + selectionLayer.start;
                  return absPos >= overlap.start && absPos <= overlap.end;
                })
                .map(pos => {
                  // Convert to position relative to this overlap segment
                  return pos - (overlap.start - selectionLayer.start);
                });

              // Create a red highlight for each mismatch position
              mismatchElements = relativeToOverlap.map((pos, i) => (
                <div
                  key={`${key}-mismatch-${i}`}
                  className="veSelectionLayer veMismatchLayer notCaret"
                  style={{
                    width: charWidth,
                    left: leftMargin + xStart + pos * charWidth,
                    top: 0,
                    height: height || "100%",
                    background: "red",
                    position: "absolute",
                    opacity: 0.5
                  }}
                ></div>
              ));
            }

            return [selectionElement, ...mismatchElements, ...caretSvgs];
          });
        } else {
          return null;
        }
      })}
    </React.Fragment>
  );
  return hasSelection ? toReturn : null;
}

export default pureNoFunc(SelectionLayer);
