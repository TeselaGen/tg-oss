import { getAllRows } from "./getAllRows";
import { handleCopyRows } from "./handleCopyRows";

export const handleCopyTable = (e, opts) => {
  try {
    const allRowEls = getAllRows(e);
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
