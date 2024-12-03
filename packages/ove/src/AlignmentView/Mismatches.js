import React, { useMemo } from "react";
import { DataTable, withSelectedEntities } from "@teselagen/ui";

const getGapMap = sequence => {
  const gapMap = [0]; //a map of position to how many gaps come before that position [0,0,0,5,5,5,5,17,17,17, ]
  sequence.split("").forEach(char => {
    if (char === "-") {
      gapMap[Math.max(0, gapMap.length - 1)] =
        (gapMap[Math.max(0, gapMap.length - 1)] || 0) + 1;
    } else {
      gapMap.push(gapMap[gapMap.length - 1] || 0);
    }
  });
  return gapMap;
};

const getMismatchList = (alignmentData, mismatches) => {
  const mismatchList = [];
  const gapMap = getGapMap(alignmentData.sequence);
  const getGaps = rangeOrCaretPosition => {
    if (typeof rangeOrCaretPosition !== "object") {
      return {
        gapsBefore: gapMap[Math.min(rangeOrCaretPosition, gapMap.length - 1)]
      };
    }
    const { start, end } = rangeOrCaretPosition;
    const toReturn = {
      gapsBefore: gapMap[start],
      gapsInside:
        gapMap[Math.min(end, gapMap.length - 1)] -
        gapMap[Math.min(start, gapMap.length - 1)]
    };
    return toReturn;
  };

  const gapsBeforeSequence = getGaps(0).gapsBefore;
  for (let mismatchI = 0; mismatchI < mismatches.length; mismatchI++) {
    const mismatchEnd = mismatches[mismatchI].end;
    const mismatchStart = mismatches[mismatchI].start;
    const mismatchDifference = mismatchEnd - mismatchStart;
    // display 'position' as 1-based but store 'start' & 'end' as 0-based
    if (mismatchDifference === 0) {
      mismatchList.push({
        mismatches: mismatchStart + 1 - gapsBeforeSequence,
        start: mismatchStart - gapsBeforeSequence,
        end: mismatchStart - gapsBeforeSequence
      });
    } else {
      for (let innerI = 0; innerI <= mismatchDifference; innerI++) {
        mismatchList.push({
          mismatches: mismatchStart + innerI + 1 - gapsBeforeSequence,
          start: mismatchStart + innerI - gapsBeforeSequence,
          end: mismatchStart + innerI - gapsBeforeSequence
        });
      }
    }
  }
  return mismatchList;
};

const schema = {
  fields: [{ path: "mismatches", type: "number" }]
};

const Mismatches = props => {
  const { alignmentData, mismatches } = props;

  const mismatchList = useMemo(
    () => getMismatchList(alignmentData, mismatches),
    [alignmentData, mismatches]
  );

  let tableOfMismatches;
  if (mismatchList.length === 0) {
    tableOfMismatches = null;
  } else {
    tableOfMismatches = (
      <DataTable
        maxHeight={168}
        formName={"mismatchesTable"}
        isSimple
        compact
        noRouter
        // onRowSelect={this.handleMismatchClick}
        schema={schema}
        entities={mismatchList}
      />
    );
  }

  return (
    <div style={{ maxHeight: 180.8, overflowY: "scroll" }}>
      <div
        style={{
          // margin: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div style={{ width: 100, margin: 4 }}>{tableOfMismatches}</div>
      </div>
    </div>
  );
};

export default withSelectedEntities("mismatchesTable")(Mismatches);
