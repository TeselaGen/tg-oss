import { getCellCopyText } from "./getCellCopyText";
import { flatMap } from "lodash-es";

export const getRowCopyText = (rowEl, { specificColumn } = {}) => {
  //takes in a row element
  if (!rowEl) return [];
  const textContent = [];
  const jsonText = [];

  rowEl.children.forEach(cellEl => {
    const cellChild = cellEl.querySelector(`[data-copy-text]`);
    if (!cellChild) {
      if (specificColumn) return []; //strip it
      return; //just leave it blank
    }
    if (
      specificColumn &&
      cellChild.getAttribute("data-test") !== specificColumn
    ) {
      return [];
    }
    const [t, j] = getCellCopyText(cellChild);
    textContent.push(t);
    jsonText.push(j);
  });

  return [flatMap(textContent).join("\t"), jsonText];
};
