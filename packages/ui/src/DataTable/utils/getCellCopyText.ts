export const getCellCopyText = (cellWrapper: HTMLElement | null) => {
  const text = cellWrapper?.getAttribute("data-copy-text");
  const jsonText = cellWrapper?.getAttribute("data-copy-json");

  const textContent = text || cellWrapper?.textContent || "";
  return [textContent, jsonText];
};
