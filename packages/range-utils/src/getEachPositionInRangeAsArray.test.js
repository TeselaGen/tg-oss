var getEachPositionInRangeAsArray = require('./getEachPositionInRangeAsArray')
var expect = require('chai').expect

describe('getEachPositionInRangeAsArray', function() {
    it('should correctly determine whether a position is within a range', function() {
        expect(getEachPositionInRangeAsArray({start: 1, end: 10}, 30)).to.deep.equal([1,2,3,4,5,6,7,8,9,10])
        expect(getEachPositionInRangeAsArray({start: 10, end: 5}, 13)).to.deep.equal([10,11,12,0,1,2,3,4,5])
    })
})
