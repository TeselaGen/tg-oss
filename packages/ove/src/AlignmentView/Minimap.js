import React, { useCallback, useMemo, useRef } from "react";
import Draggable from "react-draggable";
import ReactList from "@teselagen/react-list";
import Axis from "../RowItem/Axis";
import getXStartAndWidthFromNonCircularRange from "../RowItem/getXStartAndWidthFromNonCircularRange";
import { view } from "@risingstack/react-easy-state";
import { flatMap, some, toNumber } from "lodash-es";
import {
  getOverlapOfNonCircularRanges,
  invertRange,
  isPositionWithinRange,
  splitRangeIntoTwoPartsIfItIsCircular
} from "@teselagen/range-utils";
import { massageTickSpacing } from "../utils/massageTickSpacing";
import { getClientX, getClientY } from "../utils/editorUtils";

export default ({
  alignmentTracks,
  dimensions,
  easyStore,
  laneHeight,
  laneSpacing = 1,
  minSliderSize,
  numBpsShownInLinearView,
  onMinimapScrollX,
  onSizeAdjust,
  scrollYToTrack,
  selectionLayerComp
}) => {
  const isDragging = useRef(false);
  const minimap = useRef(null);
  const lastYPosition = useRef();
  const minimapTracks = useRef(null);
  const initialDragXOffsetFromCenter = useRef();
  const initialDragYOffsetFromCenter = useRef();

  /**
   * @returns current nucleotide char
   * width, nucelotide char width scales with zooming
   */
  const charWidth = useMemo(() => {
    const [template] = alignmentTracks || [];
    const seqLength = template.alignmentData.sequence.length;
    const charWidth = Math.min(16, (dimensions?.width || 200) / seqLength);
    return charWidth || 12;
  }, [alignmentTracks, dimensions?.width]);

  /**
   * @returns the width of the highlighted region of the minimap
   */
  const scrollHandleWidth = useMemo(() => {
    const { width } = getXStartAndWidthFromNonCircularRange(
      { start: 0, end: Math.max(numBpsShownInLinearView - 1, 0) },
      charWidth
    );
    return Math.min(width, dimensions.width);
  }, [charWidth, dimensions.width, numBpsShownInLinearView]);

  const getXPositionOfClickInMinimap = e => {
    const leftStart = minimap.current.getBoundingClientRect().left;
    return Math.max(getClientX(e) - leftStart, 0);
  };

  const scrollMinimapVertical = ({
    e,
    force,
    initialDragYOffsetFromCenter
  }) => {
    const clientY = getClientY(e) - (initialDragYOffsetFromCenter || 0);
    try {
      if (
        !force &&
        isPositionWithinRange(clientY, {
          start: lastYPosition.current - 5,
          end: lastYPosition.current + 5
        })
      ) {
        // this.lastYPosition = clientY
        return;
      }
      const lanes = document.querySelectorAll(".minimapLane");
      some(lanes, lane => {
        const rect = lane.getBoundingClientRect();
        if (rect.top > clientY && rect.top - rect.height < clientY) {
          const laneI = toNumber(lane.getAttribute("data-lane-index"));
          let scrollToLane = laneI - 3;
          if (laneI === lanes.length - 1) {
            scrollToLane = laneI - 1;
          } else if (laneI === lanes.length - 2) {
            scrollToLane = laneI - 2;
          }
          scrollYToTrack(Math.max(scrollToLane, 0));
          return true;
        }
        return false;
      });
      lastYPosition.current = clientY;
    } catch (error) {
      console.error(`error in scrollMinimapVertical:`, error);
    }
  };

  const handleMinimapClick = e => {
    if (
      isDragging.current ||
      (e.target && e.target.classList.contains("minimapCaret"))
    ) {
      e.stopPropagation();
      return;
    }
    const percent =
      (getXPositionOfClickInMinimap(e) - scrollHandleWidth / 2) /
      ((dimensions?.width || 200) - scrollHandleWidth);
    onMinimapScrollX(percent);
    scrollMinimapVertical({ e, force: true });
  };

  const handleDragStop = () => {
    // this.hasSetDirection = false;
    setTimeout(() => {
      isDragging.current = false;
    }, 150);
  };
  /**
   * Handler for beginning to drag across the minimap
   * Sets this.initialDragXOffsetFromCenter and Y for dragging
   * @param {*} e - event
   */
  const handleDragStart = e => {
    const eventX = e.pageX;
    const handleEl = window.document.querySelector(".verticalScrollDisplay");
    if (!handleEl) return;
    const { x, width } = handleEl.getBoundingClientRect();
    const yellowScrollHandleXCenter = x + width / 2;
    initialDragXOffsetFromCenter.current = eventX - yellowScrollHandleXCenter;
    const eventY = e.pageY;

    if (!handleEl) return;
    const { y, height } = handleEl.getBoundingClientRect();
    const yellowScrollHandleYCenter = y + height / 2;
    initialDragYOffsetFromCenter.current = eventY - yellowScrollHandleYCenter;
  };

  /**
   * Moves the highlighted region as we drag
   * @param {*} e - event
   */
  const handleDrag = e => {
    isDragging.current = true; //needed to block erroneous click events from being triggered!
    const percent =
      (getXPositionOfClickInMinimap(e) -
        (initialDragXOffsetFromCenter.current || 0) -
        scrollHandleWidth / 2) /
      ((dimensions?.width || 200) - scrollHandleWidth);
    onMinimapScrollX(percent);
    scrollMinimapVertical({
      e,
      initialDragYOffsetFromCenter: initialDragYOffsetFromCenter.current
    });
  };

  const itemSizeGetter = useCallback(() => {
    return laneHeight;
  }, [laneHeight]);

  /**
   * Renders a lane (one by one for each call)
   * @param {*} i - lane info
   */
  const renderItem = useCallback(
    i => {
      const {
        matchHighlightRanges: _matchHighlightRanges,
        alignmentData: { trimmedRange } = {}
      } = (alignmentTracks || [])[i];
      const matchHighlightRanges = !trimmedRange
        ? _matchHighlightRanges
        : flatMap(_matchHighlightRanges, r => {
            const overlap = getOverlapOfNonCircularRanges(r, trimmedRange);
            if (!overlap) return [];
            return { ...r, ...overlap };
          });

      //need to get the chunks that can be rendered
      let redPath = ""; //draw these as just 1 path instead of a bunch of rectangles to improve browser performance
      let bluePath = "";
      // draw one grey rectangle then draw red/mismatching regions on top of it
      const height = laneHeight - laneSpacing;
      const y = 0;
      const firstRange = getXStartAndWidthFromNonCircularRange(
        matchHighlightRanges[0],
        charWidth
      );
      const lastRange = getXStartAndWidthFromNonCircularRange(
        matchHighlightRanges[matchHighlightRanges.length - 1],
        charWidth
      );
      bluePath += `M${firstRange.xStart},${y} L${
        lastRange.xStart + lastRange.width
      },${y} L${lastRange.xStart + lastRange.width},${y + height} L${
        firstRange.xStart
      },${y + height}`;
      matchHighlightRanges.forEach(range => {
        const { xStart, width } = getXStartAndWidthFromNonCircularRange(
          range,
          charWidth
        );
        const toAdd = `M${xStart},${y} L${xStart + width},${y} L${
          xStart + width
        },${y + height} L${xStart},${y + height}`;
        if (!range.isMatch) {
          redPath += toAdd;
        }
      });
      return (
        <div
          key={i + "-lane"}
          className="minimapLane"
          data-lane-index={i}
          style={{ height: laneHeight, maxHeight: laneHeight }}
        >
          <svg
            height={laneHeight}
            width={dimensions?.width || 200}
            shapeRendering="geometricPrecision"
          >
            <path className="miniBluePath" d={bluePath} fill="#9abeff" />
            <path className="miniRedPath" d={redPath} fill="red" />
          </svg>
        </div>
      );
    },
    [alignmentTracks, charWidth, dimensions?.width, laneHeight, laneSpacing]
  );

  const template = alignmentTracks?.[0];
  const seqLength = template?.alignmentData?.sequence?.length;
  const minimapTracksPartialHeight =
    laneHeight * (alignmentTracks?.length || 0);

  return (
    <div
      ref={minimap}
      className="alignmentMinimap"
      style={{
        position: "relative",
        width: dimensions?.width || 200,
        display: "flex",
        flexDirection: "column",
        overflowX: "visible"
      }}
      onClick={handleMinimapClick}
    >
      {selectionLayerComp}
      <div
        ref={minimapTracks}
        style={{
          overflowY: minimapTracksPartialHeight > 190 ? "auto" : "hidden",
          overflowX: "hidden",
          position: "relative"
        }}
        className="alignmentMinimapTracks"
      >
        <YellowScrollHandle
          width={dimensions?.width || 200}
          handleDragStart={handleDragStart}
          handleDrag={handleDrag}
          handleDragStop={handleDragStop}
          onMinimapScrollX={onMinimapScrollX}
          minSliderSize={minSliderSize}
          onSizeAdjust={onSizeAdjust}
          easyStore={easyStore} //we use react-easy-state here to prevent costly setStates from being called
          scrollHandleWidth={scrollHandleWidth}
          laneHeight={laneHeight}
          minimapTracksPartialHeight={minimapTracksPartialHeight}
        />

        <ReactList
          itemsRenderer={(items, ref) => (
            <div
              style={{
                marginTop: -3
              }}
              ref={ref}
            >
              {items}
            </div>
          )}
          type="uniform"
          itemSizeGetter={itemSizeGetter}
          itemRenderer={renderItem}
          length={alignmentTracks?.length || 0}
        />
      </div>

      <Axis
        row={{ start: 0, end: seqLength - 1 }}
        tickSpacing={massageTickSpacing(Math.floor(seqLength / 10))}
        bpsPerRow={seqLength}
        charWidth={charWidth}
        annotationHeight={15}
        sequenceLength={seqLength}
        style={{
          height: 17,
          width: "100%"
        }}
      />
    </div>
  );
};
/**
 * Yellow Scroll handle
 * Responsible for designating the current viewing area
 * Also supports zoom/resizing using handles
 */
const YellowScrollHandle = view(
  ({
    easyStore,
    handleDrag,
    handleDragStart,
    handleDragStop,
    laneHeight,
    minimapTracksPartialHeight,
    minSliderSize,
    onSizeAdjust,
    scrollHandleWidth,
    width
  }) => {
    const xPosition = useRef();
    const { verticalVisibleRange, percentScrolled } = easyStore;
    const xScroll = percentScrolled * (width - scrollHandleWidth);
    return (
      <Draggable
        bounds="parent"
        zIndex={105}
        handle=".handle"
        position={{ x: xScroll, y: 0 }}
        axis="x"
        // onStart={this.onStart}
        onStop={handleDragStop}
        onDrag={handleDrag}
        onStart={handleDragStart}
      >
        <div
          style={{
            height: minimapTracksPartialHeight || 0,
            // height: "100%",
            border: "none",
            top: "0px",
            position: "absolute",
            zIndex: "10"
          }}
        >
          {/* left hand side drag handle */}
          <Draggable
            bounds={{
              left: -xScroll,
              right: scrollHandleWidth - minSliderSize
            }}
            zIndex={105}
            position={{ x: 0, y: 0 }}
            axis="x"
            onStart={(e, { x }) => {
              xPosition.current = x;
            }}
            onStop={(e, { x }) => {
              const deltaX = x - xPosition.current;

              const newSliderSize = scrollHandleWidth - deltaX;
              //user is resizing to the left so we need to update the scroll percentage so the slider does not jump
              const newScrollPercent = Math.min(
                1,
                (xScroll + deltaX) / (width - newSliderSize)
              );
              onSizeAdjust(newSliderSize, newScrollPercent);
            }}
          >
            {/* caret component */}
            <div
              style={{
                height: minimapTracksPartialHeight || 0,
                // height: "100%",
                border: "none",
                cursor: "ew-resize",
                opacity: "1",
                top: "0px",
                position: "absolute",
                zIndex: "10",
                width: 2,
                background: "black"
              }}
              className="minimapCaret"
            />
          </Draggable>
          {/* the actual handle component */}
          <div
            className="handle alignmentMinimapScrollHandle"
            dataname="scrollGroup"
            style={{
              height: minimapTracksPartialHeight || 0,
              border: "none",
              cursor: "move",

              zIndex: "10",
              width: scrollHandleWidth,
              background: "transparent"
            }}
          >
            {/* this is the vertical scroll position display element */}
            <div
              className="verticalScrollDisplay"
              style={{
                height:
                  (verticalVisibleRange.end - verticalVisibleRange.start + 1) *
                  laneHeight,
                zIndex: "-10",
                background: "#fbfb2873",
                borderTop: "2px solid yellow",
                borderBottom: "2px solid yellow",
                position: "relative",
                top: verticalVisibleRange.start * laneHeight
              }}
            />
          </div>
          {/* right hand side drag handle */}
          <Draggable
            bounds={{
              right: minSliderSize + width - xScroll,
              left: minSliderSize
            }}
            zIndex={105}
            position={{ x: scrollHandleWidth, y: 0 }}
            axis="x"
            onStart={(e, { x }) => {
              xPosition.current = x;
            }}
            onStop={(e, { x }) => {
              const deltaX = xPosition.current - x;
              const newSliderSize = scrollHandleWidth - deltaX;
              //user is resizing to the right so we need to update the scroll percentage so the slider does not jump
              const newScrollPercent = xScroll / (width - newSliderSize);
              onSizeAdjust(newSliderSize, newScrollPercent);
            }}
          >
            <div
              style={{
                height: minimapTracksPartialHeight || 0,
                // height: "100%",
                border: "none",
                cursor: "ew-resize",
                opacity: "1",
                top: "0px",
                // right: 0,
                position: "absolute",
                zIndex: "10",
                width: 2,
                background: "black"
              }}
              className="minimapCaret"
            />
          </Draggable>
        </div>
      </Draggable>
    );
  }
);

export function getTrimmedRangesToDisplay({ trimmedRange, seqLen }) {
  if (!trimmedRange) return [];
  const inverted = invertRange(trimmedRange, seqLen);
  return splitRangeIntoTwoPartsIfItIsCircular(inverted, seqLen);
}
