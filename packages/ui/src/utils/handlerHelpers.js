export const onEnterHelper = callback => ({
  onKeyDown: event => {
    if (event.key === "Enter") {
      callback(event);
    }
  }
});

export const onBlurHelper = callback => ({
  onBlur: event => {
    callback(event);
  }
});

export const onEnterOrBlurHelper = callback => ({
  onKeyDown: function (event) {
    if (event.key === "Enter") {
      callback(event);
    }
  },
  onBlur: function (event) {
    callback(event);
  }
});
