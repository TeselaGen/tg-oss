var translateRange = require('./translateRange')
var expect = require('chai').expect

describe('translateRange', function() {
    it('should correctly translate a range', function() {
        expect(translateRange({start: 0, end: 10}, 10, 30)).to.deep.equal({
            start: 10,
            end: 20,
        })
        expect(translateRange({start: 0, end: 10}, 10, 15)).to.deep.equal({
            start: 10,
            end: 5,
        })
        expect(translateRange({start: 9, end: 10}, 10, 15)).to.deep.equal({
            start: 4,
            end: 5,
        })
      
    })
})
