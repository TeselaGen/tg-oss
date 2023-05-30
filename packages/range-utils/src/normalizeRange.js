//normalize range takes in a range that might be slightly outside of the rangeMax and wraps the start/end as necessary to fit
const { assign } = require("lodash");
var normalizePositionByRangeLength = require('./normalizePositionByRangeLength');
module.exports = function normalizeRange(range, sequenceLength) {
    return assign({}, range, {
        start: normalizePositionByRangeLength(range.start, sequenceLength),
        end: normalizePositionByRangeLength(range.end, sequenceLength),
    })
};
