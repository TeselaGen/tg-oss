import React from "react";
import { times, map } from "lodash-es";
import { view } from "@risingstack/react-easy-state";
import { getVisibleStartEnd } from "../utils/getVisibleStartEnd";
import { fudge2, realCharWidth } from "./constants";
import dnaToColor, {
  getDnaColor,
  getSerineThreonineColor,
  getNegativeColor,
  getPositiveColor,
  getChargedColor,
  getHydrophobicity,
  getPolarColor,
  getAliphaticColor,
  getAromaticColor,
  getColorScheme,
  serineThreonineToColor,
  hydrophobicityColor,
  polarColors,
  negativeColors,
  positiveColors,
  chargedColors,
  aliphaticColors,
  aromaticColors,
  colorScheme
} from "../constants/dnaToColor";
import { hoveredAnnEasyStore } from "../helperComponents/withHover";
import { getOverlapsOfPotentiallyCircularRanges } from "@teselagen/range-utils";
import { partOverhangs } from "./partOverhangs";
import { isPositionWithinRange } from "@teselagen/range-utils";
import { isSafari } from "@teselagen/ui";

const getChunk = (sequence, chunkSize, chunkNumber) =>
  sequence.slice(chunkSize * chunkNumber, chunkSize * (chunkNumber + 1));

function renderColoredLayer(props, fudge, width, toColor) {
  return (
    <svg
      style={{
        left: props.startOffset * props.charWidth,
        height: props.height,
        width,
        position: "absolute"
      }}
      className="rowViewTextContainer"
      height={Math.max(0, Number(props.height))}
    >
      <ColoredSequence
        {...props}
        fudge={fudge}
        totalWidth={width}
        toColor={toColor}
      />
    </svg>
  );
}

class Sequence extends React.Component {
  render() {
    const {
      isReplacementLayer,
      sequence,
      hideBps,
      charWidth,
      containerStyle = {},
      children,
      isReverse,
      height,
      className,
      startOffset = 0,
      chunkSize = 100,
      scrollData,
      showDnaColors,
      showSerineThreonine,
      showHydrophobicity,
      showPolar,
      showNegative,
      showPositive,
      showCharged,
      showAliphatic,
      showAromatic,
      showColorScheme,
      fivePrimeThreePrimeHints,
      alignmentData,
      sequenceLength,
      rowStart,
      rowEnd
    } = this.props;

    // the fudge factor is used to position the sequence in the middle of the <text> element
    const fudge = charWidth - realCharWidth;
    const gapsBeforeSequence = 0;
    const seqReadWidth = 0;

    const rowSeqLen = sequence.length;
    let overlapToBold;
    let isDigestPart;
    [hoveredAnnEasyStore.hoveredAnn].forEach(ann => {
      if (ann && !isReplacementLayer) {
        let start = ann.start;
        let end = ann.end - 1;

        partOverhangs.forEach(h => {
          if (ann[h]) {
            isDigestPart = true;
            if (h.includes("Underhang") && isReverse) {
              return;
            } else if (h.includes("Overhang") && !isReverse) {
              return;
            }
            const overhangBps = ann[h];
            if (h.includes("fivePrime")) {
              start = start + overhangBps.length;
            } else {
              end = end - overhangBps.length;
            }
          }
        });

        overlapToBold = isDigestPart
          ? getOverlapsOfPotentiallyCircularRanges(
              { start, end },
              {
                start: rowStart,
                end: rowEnd
              },
              sequenceLength
            )
          : undefined;
      }
    });

    const colorLayers = [
      { show: showSerineThreonine, toColor: "serineThreonine" },
      { show: showHydrophobicity, toColor: "hydrophobicity" },
      { show: showPolar, toColor: "polar" },
      { show: showNegative, toColor: "negative" },
      { show: showPositive, toColor: "positive" },
      { show: showCharged, toColor: "charged" },
      { show: showAliphatic, toColor: "aliphatic" },
      { show: showAromatic, toColor: "aromatic" },
      { show: showColorScheme, toColor: "colorScheme" }
    ];

    const style = {
      position: "relative",
      height,
      left: gapsBeforeSequence * charWidth,
      ...containerStyle
    };

    const width = rowSeqLen * charWidth;

    let inner;
    const shared = {
      y: height - height / 4,
      className:
        "ve-monospace-font " + (isReverse ? " ve-sequence-reverse" : "")
    };
    if (scrollData) {
      const numChunks = Math.ceil(rowSeqLen / chunkSize);
      const chunkWidth = chunkSize * charWidth;
      //we're in the alignment view alignments only
      const { visibleStart, visibleEnd } = getVisibleStartEnd({
        scrollData,
        width
      });
      inner = times(numChunks, i => {
        const seqChunk = getChunk(sequence, chunkSize, i);
        const textLength = charWidth * seqChunk.length;
        const x = i * chunkWidth;
        if (x > visibleEnd || x + textLength < visibleStart) return null;
        const tlToUse = Math.max(0, textLength - fudge - fudge2);
        return (
          <text
            key={i}
            {...{
              ...shared,
              textLength: tlToUse,
              x: x + fudge / 2,
              lengthAdjust: "spacing"
            }}
          >
            {seqChunk}
          </text>
        );
      });
    } else {
      const tlToUse = Math.max(
        0,
        (alignmentData ? seqReadWidth : width) - fudge - fudge2
      );
      inner = (
        <text
          {...{
            ...shared,
            x: 0 + fudge / 2,
            textLength: tlToUse
          }}
        >
          {getBoldRegion({
            sequence,
            overlapToBold,
            rowStart,
            sequenceLength
          })}
        </text>
      );
    }
    return (
      <div
        style={style}
        className={(className ? className : "") + " ve-row-item-sequence"}
      >
        {fivePrimeThreePrimeHints && (
          <div
            className={`tg-${
              isReverse ? "left" : "right"
            }-prime-direction tg-prime-direction`}
            style={
              !isReverse ? { left: startOffset * charWidth + width } : undefined
            }
          >
            3'
          </div>
        )}
        {fivePrimeThreePrimeHints && (
          <div
            className={`tg-${
              isReverse ? "right" : "left"
            }-prime-direction tg-prime-direction`}
            style={
              isReverse ? { left: startOffset * charWidth + width } : undefined
            }
          >
            5'
          </div>
        )}
        {colorLayers.map(
          ({ show, toColor }) =>
            show && renderColoredLayer(this.props, fudge, width, toColor)
        )}
        {!hideBps && (
          <svg
            style={{
              left: startOffset * charWidth,
              height,
              width,
              position: "absolute"
            }}
            className="rowViewTextContainer"
            height={Math.max(0, Number(height))}
          >
            {showDnaColors && (
              <ColoredSequence
                {...{
                  ...this.props,
                  fudge,
                  totalWidth: width,
                  toColor: "dnaColor"
                }}
              />
            )}
            {inner}
          </svg>
        )}

        {children}
      </div>
    );
  }
}

export default view(Sequence);

class ColoredSequence extends React.Component {
  shouldComponentUpdate(newProps) {
    const { props } = this;
    if (
      ["charWidth", "sequence", "height", "isReverse", "width"].some(
        key => props[key] !== newProps[key]
      )
    )
      return true;
    if (!!props.alignmentData !== !!newProps.alignmentData) return true;
    return false;
  }
  drawRects = () => {
    let {
      charWidth,
      sequence,
      height,
      isReverse,
      alignmentData,
      getGaps,
      fudge,
      totalWidth,
      toColor
    } = this.props;
    if (alignmentData) {
      sequence = sequence.replace(/^-+/g, "").replace(/-+$/g, "");
    }
    const colorMap = {
      dnaColor: dnaToColor,
      serineThreonine: serineThreonineToColor,
      hydrophobicity: hydrophobicityColor,
      polar: polarColors,
      negative: negativeColors,
      positive: positiveColors,
      charged: chargedColors,
      aliphatic: aliphaticColors,
      aromatic: aromaticColors,
      colorScheme: colorScheme
    };

    const colorMethods = {
      dnaColor: getDnaColor,
      serineThreonine: getSerineThreonineColor,
      hydrophobicity: getHydrophobicity,
      polar: getPolarColor,
      negative: getNegativeColor,
      positive: getPositiveColor,
      charged: getChargedColor,
      aliphatic: getAliphaticColor,
      aromatic: getAromaticColor,
      colorScheme: getColorScheme
    };
    //we use big paths instead of many individual rects to improve performance
    const colorPaths = Object.values(colorMap[toColor]).reduce((acc, color) => {
      acc[color] = "";
      return acc;
    }, {});
    const gapsBefore = getGaps ? getGaps({ start: 0, end: 0 }).gapsBefore : 0;
    sequence.split("").forEach((char, i) => {
      const width = Number(charWidth);
      const color = colorMethods[toColor](char, isReverse);
      const x = (i + gapsBefore) * charWidth;
      const y = 0;
      colorPaths[color] =
        (colorPaths[color] || "") +
        `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${
          y + height
        }`;
    });
    const scalex = (totalWidth - fudge) / totalWidth;

    return (
      <g
        style={{
          transform: `scaleX(${scalex})`
        }}
      >
        {map(colorPaths, (d, color) => {
          return <path transform="tran" key={color} d={d} fill={color} />;
        })}
      </g>
    );
  };
  render() {
    return this.drawRects();
  }
}

function getBoldRegion({ sequence, overlapToBold, rowStart, sequenceLength }) {
  if (isSafari) {
    // safari doesn't support text length with tspans so we can't bold the sequence - https://github.com/TeselaGen/tg-oss/issues/80
    return sequence;
  }
  const toRet = [];
  const [a, b] = overlapToBold || [];
  for (let index = rowStart; index < sequence.length + rowStart; index++) {
    const element = sequence[index - rowStart];
    if (
      (a && isPositionWithinRange(index, a, sequenceLength, true, true)) ||
      (b && isPositionWithinRange(index, b, sequenceLength, true, true))
    ) {
      toRet.push(<tspan className="isBoldSeq">{element}</tspan>);
    } else {
      toRet.push(element);
    }
  }
  return toRet;
}
