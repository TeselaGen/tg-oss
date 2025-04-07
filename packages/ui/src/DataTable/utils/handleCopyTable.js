import { getAllRows } from "./getAllRows";
import { handleCopyRows } from "./handleCopyRows";

export const handleCopyTable = (tableRef, opts) => {
  try {
    const allRowEls = getAllRows(tableRef);
    if (!allRowEls) return;
    handleCopyRows(allRowEls, {
      ...opts,
      onFinishMsg: "Table Copied"
    });
  } catch (error) {
    console.error(`error:`, error);
    window.toastr.error("Error copying rows.");
  }
};
