import { Position, Toaster, Intent, Classes } from "@blueprintjs/core";
import classNames from "classnames";

const TopToaster = Toaster.create({
  className: "top-toaster",
  position: Position.TOP
});

const BottomToaster = Toaster.create({
  className: "bottom-toaster",
  position: Position.BOTTOM
});

window.__tgClearAllToasts = () => {
  TopToaster.clear();
  BottomToaster.clear();
};

let counter = 5000;
const generateToast = intent => (message, options) => {
  options = options || {};
  const toastToUse = options.bottom ? BottomToaster : TopToaster;
  let updatedTimeout;
  if (options.updateTimeout) {
    //generate a slightly different than default timeout to make the update stay on the page for a full 5 seconds
    if (counter > 5500) {
      updatedTimeout = --counter;
    } else {
      updatedTimeout = ++counter;
    }
  }
  if (intent === Intent.DANGER) {
    console.error("Toastr error message: ", message);
  }
  if (intent === Intent.WARNING) {
    console.error("Toastr warning message: ", message);
  }

  const maybeAddClearAll = () => {
    // wipe any existing clear all buttons
    const existingClearAllButtons =
      document.querySelectorAll(`.tg-clear-all-toasts`);
    existingClearAllButtons.forEach(button => {
      button.remove();
    });
    const activeToasts = document.querySelectorAll(
      `.bp5-toast:not(.bp5-toast-exit)`
    );
    if (activeToasts.length > 1) {
      // add custom clear all button

      const topToaster = document.querySelector(`.bp5-toast`);
      if (!topToaster) return;
      const closeButton = document.createElement("div");
      closeButton.classList.add(
        Classes.BUTTON,
        Classes.LARGE,
        Classes.INTENT_PRIMARY,
        "tg-clear-all-toasts"
      );
      closeButton.innerText = "Clear all";
      closeButton.onclick = window.__tgClearAllToasts;
      // position the button to the right of the message
      closeButton.style.position = "absolute";
      closeButton.style.right = "-100px";

      topToaster.appendChild(closeButton);
    }
  };
  const uniqKey = toastToUse.show(
    {
      intent,
      message,
      onDismiss: () => {
        if (options.onDismiss) {
          options.onDismiss();
        }
        setTimeout(() => {
          maybeAddClearAll();
        }, 0);
      },
      timeout:
        options.timeout ||
        updatedTimeout ||
        (!window.Cypress &&
        (intent === Intent.DANGER || intent === Intent.WARNING)
          ? 60000
          : undefined),
      action: options.action,
      icon: options.icon,
      className: classNames("preserve-newline", options.className)
    },
    options.key
  );
  setTimeout(() => {
    maybeAddClearAll();
  }, 0);
  function clear() {
    toastToUse.dismiss(uniqKey);
    setTimeout(() => {
      maybeAddClearAll();
    }, 0);
  }
  clear.key = uniqKey;
  return clear;
};

function preventDuplicates(func) {
  const previousToasts = {};
  return (message, options = {}) => {
    const clearToast = func(message, options);
    // no duplicate check for toasts with updates

    if (!options.key) {
      if (!options.key && previousToasts[message]) {
        previousToasts[message](); //clear it!
      }

      setTimeout(() => {
        delete previousToasts[message];
      }, options.timeout || 5000);

      previousToasts[message] = clearToast;
    }
    return clearToast;
  };
}

if (!window.toastr) window.toastr = {};
if (!window.toastr.success) {
  window.toastr.success = preventDuplicates(generateToast(Intent.SUCCESS));
}

if (!window.toastr.error) {
  window.toastr.error = preventDuplicates(generateToast(Intent.DANGER));
}

if (!window.toastr.warning) {
  window.toastr.warning = preventDuplicates(generateToast(Intent.WARNING));
}

if (!window.toastr.info) {
  window.toastr.info = preventDuplicates(generateToast(Intent.PRIMARY));
}

if (!window.toastr.default) {
  window.toastr.default = preventDuplicates(generateToast(Intent.NONE));
}
