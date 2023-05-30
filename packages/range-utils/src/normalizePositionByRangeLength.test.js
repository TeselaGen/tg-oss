var expect = require('chai').expect
var normalizePositionByRangeLength = require('./normalizePositionByRangeLength')
describe('normalizePositionByRangeLength', function() {
    it('should normalize positions by their max length, assuming 0-based inclusive indices', function() {
        expect(normalizePositionByRangeLength(10,9)).to.equal(1)
        expect(normalizePositionByRangeLength(9,9)).to.equal(0)
        expect(normalizePositionByRangeLength(3572,2000)).to.equal(1572)
    })
    it('should set something more than twice outside the sequence length to either 0 or sequenceLength-1', function () {
        expect(normalizePositionByRangeLength(-3572,2000)).to.equal(0)
        expect(normalizePositionByRangeLength(33572,2000)).to.equal(1999)
    })
    it('should handle isInBetweenPositions === true being passed in ', function() {
      expect(normalizePositionByRangeLength(9,9,true)).to.equal(9)
    })
    it('should set something more than twice outside the sequence length to either 0 or sequenceLength when isInBetweenPositions is true', function () {
        expect(normalizePositionByRangeLength(-3572,2000, true)).to.equal(0)
        expect(normalizePositionByRangeLength(33572,2000, true)).to.equal(2000)
    })
    it('should not do anything if it does not have to', function() {
        expect(normalizePositionByRangeLength(10,99)).to.equal(10)
    })
})
