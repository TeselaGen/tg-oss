// import { onlyUpdateForKeys } from "recompose";
import draggableClassnames from "../../constants/draggableClassnames";
import React from "react";
import Caret from "../Caret";
import pureNoFunc from "../../utils/pureNoFunc";

import "./style.css";

import getXStartAndWidthOfRangeWrtRow from "../getXStartAndWidthOfRangeWrtRow";
import { getOverlapsOfPotentiallyCircularRanges } from "@teselagen/range-utils";
import {
  getSelectionMessage,
  preventDefaultStopPropagation
} from "../../utils/editorUtils";

function SelectionLayer({
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
}) {
  let hasSelection = false;

  const toReturn = (
    <>
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
            return [
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
              />,
              ...caretSvgs
            ];
          });
        } else {
          return null;
        }
      })}
    </>
  );
  return hasSelection ? toReturn : null;
}

export default pureNoFunc(SelectionLayer);
