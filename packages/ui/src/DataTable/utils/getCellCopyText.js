export const getCellCopyText = cellWrapper => {
  const text = cellWrapper && cellWrapper.getAttribute("data-copy-text");
  const jsonText = cellWrapper && cellWrapper.getAttribute("data-copy-json");

  const textContent = text || cellWrapper.textContent || "";
  return [textContent, jsonText];
};
