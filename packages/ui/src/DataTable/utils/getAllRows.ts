import type { RefObject } from "react";

export const getAllRows = (
  tableRef: RefObject<{ tableRef: HTMLDivElement }>
) => {
  const allRowEls = tableRef.current?.tableRef?.querySelectorAll(".rt-tr");
  if (!allRowEls || !allRowEls.length) {
    return;
  }
  return allRowEls;
};
