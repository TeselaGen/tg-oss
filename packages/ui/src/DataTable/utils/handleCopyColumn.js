import { getAllRows } from "./getAllRows";
import getIdOrCodeOrIndex from "./getIdOrCodeOrIndex";
import { handleCopyRows } from "./handleCopyRows";

export const handleCopyColumn = (e, cellWrapper, selectedRecords) => {
  const specificColumn = cellWrapper.getAttribute("data-test");
  let rowElsToCopy = getAllRows(e);
  if (!rowElsToCopy) return;
  if (selectedRecords) {
    const ids = selectedRecords.map(e => getIdOrCodeOrIndex(e)?.toString());
    rowElsToCopy = Array.from(rowElsToCopy).filter(rowEl => {
      const id = rowEl.closest(".rt-tr-group")?.getAttribute("data-test-id");
      return id !== undefined && ids.includes(id);
    });
  }
  if (!rowElsToCopy) return;
  handleCopyRows(rowElsToCopy, {
    specificColumn,
    onFinishMsg: "Column Copied"
  });
};
