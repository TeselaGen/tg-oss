module.exports = function getRangesBetweenTwoRanges(range1, range2) {
    // {
    //     start: 85,
    //     end: 92
    // }

    // {
    //     start: 130,
    //     end: 189
    // }

    // start1 - end2

    // start2 - end1

    var newRanges = []	
    if (!(range1.start > -1 && range1.end > -1 && range2.start > -1 && range2.end > -1)) {
        return newRanges
    }
    return [{
        start: range1.start,
        end: range2.end,
    },{
        start: range2.start,
        end: range1.end,
    }]    
};

