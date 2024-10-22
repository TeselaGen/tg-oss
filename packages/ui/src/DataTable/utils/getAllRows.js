export const getAllRows = e => {
  const el = e.target.querySelector(".data-table-container")
    ? e.target.querySelector(".data-table-container")
    : e.target.closest(".data-table-container");

  const allRowEls = el.querySelectorAll(".rt-tr");
  if (!allRowEls || !allRowEls.length) {
    return;
  }
  return allRowEls;
};
