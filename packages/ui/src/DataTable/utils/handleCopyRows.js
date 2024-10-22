import download from "downloadjs";
import { getRowCopyText } from "./getRowCopyText";
import { handleCopyHelper } from "./handleCopyHelper";

export const handleCopyRows = (
  rowElsToCopy,
  { specificColumn, onFinishMsg, isDownload } = {}
) => {
  let textToCopy = [];
  const jsonToCopy = [];
  rowElsToCopy.forEach(rowEl => {
    const [t, j] = getRowCopyText(rowEl, { specificColumn });
    textToCopy.push(t);
    jsonToCopy.push(j);
  });
  textToCopy = textToCopy.filter(text => text).join("\n");
  if (!textToCopy) return window.toastr.warning("No text to copy");
  if (isDownload) {
    download(textToCopy.replaceAll("\t", ","), "tableData.csv", "text/csv");
  } else {
    handleCopyHelper(textToCopy, jsonToCopy, onFinishMsg || "Row Copied");
  }
};
