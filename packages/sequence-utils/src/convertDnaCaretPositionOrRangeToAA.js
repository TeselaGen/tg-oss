module.exports = function convertDnaCaretPositionOrRangeToAA(rangeOrCaret) {
  if (typeof rangeOrCaret === "object" && rangeOrCaret !== null) {
    return convertDnaRangeToAARange({
      ...rangeOrCaret,
      locations: rangeOrCaret.locations
        ? rangeOrCaret.locations.map(convertDnaRangeToAARange)
        : undefined
    });
  } else {
    return convertDnaCaretPositionToAACaretPosition(rangeOrCaret);
  }
};

function convertDnaCaretPositionToAACaretPosition(caret) {
  return Math.floor(caret / 3);
}

function convertDnaRangeToAARange(range) {
  return {
    ...range,
    start: range.start > -1 ? Math.floor(range.start / 3) : range.start,
    end: range.end > -1 ? Math.floor(range.end - 2) / 3 : range.end
  };
}
