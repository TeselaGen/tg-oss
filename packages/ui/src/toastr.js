import { Position, Toaster, Intent } from "@blueprintjs/core";

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
  const uniqKey = toastToUse.show(
    {
      intent,
      message,
      timeout:
        options.timeout || updatedTimeout || intent === Intent.DANGER
          ? 60000
          : undefined,
      action: options.action,
      icon: options.icon,
      className: options.className
    },
    options.key
  );
  function clear() {
    toastToUse.dismiss(uniqKey);
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
