import React from "react";
import { isEqual } from "lodash-es";
import { convertRangeTo1Based } from "@teselagen/range-utils";
import selectors from "../../selectors";

export const sizeSchema = () => ({
  path: "size",
  type: "number",
  render: (val, record) => {
    const base1Range = convertRangeTo1Based(record);
    const hasJoinedLocations = record.locations && record.locations.length > 1;

    return (
      <span>
        {val}{" "}
        <span style={{ fontSize: 10 }}>
          {hasJoinedLocations ? (
            record.locations.map((loc, i) => {
              const base1Range = convertRangeTo1Based(loc);
              return (
                <span key={i}>
                  ({base1Range.start}-{base1Range.end})
                </span>
              );
            })
          ) : (
            <span>
              ({base1Range.start}-{base1Range.end})
            </span>
          )}
        </span>
      </span>
    );
  }
});

export const getMemoOrfs = (() => {
  let lastDeps;
  let lastResult;
  return editorState => {
    const { sequenceData, minimumOrfSize, useAdditionalOrfStartCodons } =
      editorState;

    const { sequence, circular } = sequenceData;

    const deps = {
      sequence,
      circular,
      minimumOrfSize,
      useAdditionalOrfStartCodons
    };
    if (lastResult && isEqual(deps, lastDeps)) {
      return lastResult;
    }
    lastResult = selectors.orfsSelector(editorState);
    lastDeps = deps;
    return lastResult;
  };
})();
