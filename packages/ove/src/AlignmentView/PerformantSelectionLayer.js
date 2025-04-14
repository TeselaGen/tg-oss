import React, { useMemo } from "react";
import SelectionLayer from "../RowItem/SelectionLayer";
import { view } from "@risingstack/react-easy-state";

export const PerformantSelectionLayer = view(({ easyStore, ...rest }) => {
  const seqLen = rest.sequenceLength - 1;

  const regions = useMemo(
    () => [
      { ...easyStore.selectionLayer, ignoreGaps: true },
      {
        start: Math.floor(
          (easyStore.percentScrolledPreZoom || easyStore.percentScrolled) *
            seqLen
        ),
        end: Math.floor(
          (easyStore.percentScrolledPreZoom || easyStore.percentScrolled) *
            seqLen
        ),
        className: "zoomSelection",
        ignoreGaps: true,
        style: {
          zIndex: -1,
          opacity: 0
        }
      }
    ],
    [
      easyStore.percentScrolled,
      easyStore.percentScrolledPreZoom,
      easyStore.selectionLayer,
      seqLen
    ]
  );

  return <SelectionLayer regions={regions} {...rest} />;
});
