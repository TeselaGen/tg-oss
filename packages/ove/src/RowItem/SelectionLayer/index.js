// import { onlyUpdateForKeys } from "recompose";
import draggableClassnames from "../../constants/draggableClassnames";
import React, { useMemo } from "react";
import Caret from "../Caret";
import getXStartAndWidthOfRangeWrtRow from "../getXStartAndWidthOfRangeWrtRow";
import { getOverlapsOfPotentiallyCircularRanges } from "@teselagen/range-utils";
import {
  getSelectionMessage,
  preventDefaultStopPropagation
} from "../../utils/editorUtils";
import "./style.css";

const SelectionLayer = ({
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
}) => {
  const overlapsArray = useMemo(() => {
    return regions.map(selectionLayer => {
      if (selectionLayer.start > -1) {
        return getOverlapsOfPotentiallyCircularRanges(
          selectionLayer,
          row,
          sequenceLength
        );
      }
      return [];
    });
  }, [regions, row, sequenceLength]);

  if (overlapsArray.flat().length === 0) {
    return null;
  }

  return regions.map(function (selectionLayer, topIndex) {
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
    if (start <= -1) return null;
    return overlapsArray[topIndex].map((overlap, index) => {
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
              leftMargin={leftMargin}
              onClick={_onClick || preventDefaultStopPropagation}
              onRightClick={onSelectionContextMenu}
              charWidth={charWidth}
              row={row}
              style={selectionLayer.style}
              getGaps={getGaps}
              isDraggable={isDraggable}
              ignoreGaps={ignoreGaps}
              key={key + "caret1"}
              sequenceLength={sequenceLength}
              className={
                classNameToPass +
                " selectionLayerCaret " +
                (isDraggable ? draggableClassnames.selectionStart : "")
              }
              caretPosition={overlap.start}
            />
          ),
          overlap.end === end && (
            <Caret
              leftMargin={leftMargin}
              onClick={_onClick || preventDefaultStopPropagation}
              onRightClick={onSelectionContextMenu}
              charWidth={charWidth}
              isDraggable={isDraggable}
              row={row}
              getGaps={getGaps}
              style={selectionLayer.style}
              ignoreGaps={ignoreGaps}
              key={key + "caret2"}
              sequenceLength={sequenceLength}
              className={
                classNameToPass +
                " selectionLayerCaret " +
                (isDraggable ? draggableClassnames.selectionEnd : "")
              }
              caretPosition={overlap.end + 1}
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
  });
};

export default SelectionLayer;
