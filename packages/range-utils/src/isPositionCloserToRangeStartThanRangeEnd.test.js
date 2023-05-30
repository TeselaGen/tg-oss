const isPositionCloserToRangeStartThanRangeEnd = require('./isPositionCloserToRangeStartThanRangeEnd');
const expect = require('chai').expect

describe('isPositionCloserToRangeStartThanRangeEnd', function() {
    it('should correctly determine whether a position is closer to the start of a range than the end', function() {
        expect(isPositionCloserToRangeStartThanRangeEnd(0,{start: 1, end: 10}, 100)).to.equal(true)
        expect(isPositionCloserToRangeStartThanRangeEnd(1,{start: 0, end: 10}, 100)).to.equal(true)
        expect(isPositionCloserToRangeStartThanRangeEnd(11,{start: 1, end: 10}, 100)).to.equal(false)
        expect(isPositionCloserToRangeStartThanRangeEnd(0,{start: 0, end: 10}, 100)).to.equal(true)
        expect(isPositionCloserToRangeStartThanRangeEnd(10,{start: 0, end: 10}, 100)).to.equal(false)
        expect(isPositionCloserToRangeStartThanRangeEnd(10,{start: 10, end: 5}, 100)).to.equal(true)
        expect(isPositionCloserToRangeStartThanRangeEnd(11,{start: 10, end: 5}, 100)).to.equal(true)
        expect(isPositionCloserToRangeStartThanRangeEnd(4,{start: 10, end: 5}, 100)).to.equal(false)
        expect(isPositionCloserToRangeStartThanRangeEnd(5,{start: 10, end: 5}, 100)).to.equal(false)
        expect(isPositionCloserToRangeStartThanRangeEnd(6,{start: 10, end: 5}, 100)).to.equal(false)
    })
})
