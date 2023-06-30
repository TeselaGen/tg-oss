export function onEnterHelper(callback) {
  return {
    onKeyDown: function(event) {
      if (event.key === "Enter") {
        callback(event);
      }
    }
  };
}

export function onBlurHelper(callback) {
  return {
    onBlur: function(event) {
      callback(event);
    }
  };
}

export function onEnterOrBlurHelper(callback) {
  return {
    onKeyDown: function(event) {
      if (event.key === "Enter") {
        callback(event);
      }
    },
    onBlur: function(event) {
      callback(event);
    }
  };
}
