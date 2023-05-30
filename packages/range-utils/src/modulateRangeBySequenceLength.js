var normalizePositionByRangeLength = require('./normalizePositionByRangeLength')
var provideInclusiveOptions = require('./provideInclusiveOptions')
const { assign } = require("lodash")
module.exports = provideInclusiveOptions(modulateRangeBySequenceLength)

function modulateRangeBySequenceLength(range, seqLen) {
    return assign(range, {
        start: normalizePositionByRangeLength(range.start, seqLen),
        end: normalizePositionByRangeLength(range.end, seqLen)
    })
}
