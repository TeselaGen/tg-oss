import React from "react";
import { convertDnaCaretPositionOrRangeToAA } from "@teselagen/sequence-utils";
import { convertRangeTo1Based } from "@teselagen/range-utils";

export const sizeSchema = isProtein => ({
  path: "size",
  type: "number",
  render: (val, _record) => {
    const record = isProtein
      ? convertDnaCaretPositionOrRangeToAA(_record)
      : _record;
    const base1Range = convertRangeTo1Based(record);
    const hasJoinedLocations = record.locations && record.locations.length > 1;

    return (
      <span>
        {isProtein ? Math.floor(val / 3) : val}{" "}
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
