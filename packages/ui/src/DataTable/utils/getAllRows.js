export const getAllRows = tableRef => {
  const allRowEls = tableRef.current?.tableRef?.querySelectorAll(".rt-tr");
  if (!allRowEls || !allRowEls.length) {
    return;
  }
  return allRowEls;
};
