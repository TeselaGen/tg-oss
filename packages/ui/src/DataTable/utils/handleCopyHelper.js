import copy from "copy-to-clipboard";

export const handleCopyHelper = (stringToCopy, jsonToCopy, message) => {
  !window.Cypress &&
    copy(stringToCopy, {
      onCopy: clipboardData => {
        clipboardData.setData("application/json", JSON.stringify(jsonToCopy));
      },
      // keep this so that pasting into spreadsheets works.
      format: "text/plain"
    });
  if (message) {
    window.toastr.success(message);
  }
};
