const { assign } = require("lodash")
module.exports = function convertRangeIndices(range, inputType, outputType) {
    inputType = inputType || {}
    outputType = outputType || {}
    return assign({},range,{
        start: Number(range.start) + (inputType.inclusive1BasedStart 
            ? outputType.inclusive1BasedStart
                ? 0
                : -1
            : outputType.inclusive1BasedStart
                ? 1
                : 0),
        end: Number(range.end) + (inputType.inclusive1BasedEnd 
            ? outputType.inclusive1BasedEnd
                ? 0
                : -1
            : outputType.inclusive1BasedEnd
                ? 1
                : 0)
    })
};
