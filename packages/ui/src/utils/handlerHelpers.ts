export const onEnterHelper = (
  callback: (event: React.KeyboardEvent<Element>) => void
) => ({
  onKeyDown: (event: React.KeyboardEvent<Element>) => {
    if (event.key === "Enter") {
      callback(event);
    }
  }
});

export const onBlurHelper = (
  callback: (event: React.FocusEvent<Element>) => void
) => ({
  onBlur: (event: React.FocusEvent<Element>) => {
    callback(event);
  }
});

export const onEnterOrBlurHelper = (
  callback: (
    event: React.KeyboardEvent<Element> | React.FocusEvent<Element>
  ) => void
) => ({
  onKeyDown: function (event: React.KeyboardEvent<Element>) {
    if (event.key === "Enter") {
      callback(event);
    }
  },
  onBlur: function (event: React.FocusEvent<Element>) {
    callback(event);
  }
});
