const modulatePositionByRange = require('./modulatePositionByRange')
const expect = require('chai').expect

describe('modulatePositionByRange', function() {
    it('should modulate positions by their min and max', function() {
        expect(modulatePositionByRange(0,{start: 1, end: 10})).to.equal(10)
        expect(modulatePositionByRange(11,{start: 1, end: 10})).to.equal(1)
        expect(modulatePositionByRange(0,{start: 0, end: 10})).to.equal(0)
        expect(modulatePositionByRange(10,{start: 0, end: 10})).to.equal(10)
    })
  
})
