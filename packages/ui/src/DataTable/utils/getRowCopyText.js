import { getCellCopyText } from "./getCellCopyText";
import { flatMap } from "lodash-es";

export const getRowCopyText = (rowEl, { specificColumn } = {}) => {
  //takes in a row element
  if (!rowEl) return [];
  const textContent = [];
  const jsonText = [];

  for (const cellEl of rowEl.children) {
    const cellChild = cellEl.querySelector(`[data-copy-text]`);
    if (!cellChild) {
      if (specificColumn) continue; //strip it
      continue; //just leave it blank
    }
    if (
      specificColumn &&
      cellChild.getAttribute("data-test") !== specificColumn
    ) {
      continue;
    }
    const [t, j] = getCellCopyText(cellChild);
    textContent.push(t);
    jsonText.push(j);
  }

  return [flatMap(textContent).join("\t"), jsonText];
};
