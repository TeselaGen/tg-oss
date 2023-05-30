var convertRangeIndices = require('./convertRangeIndices')
var chai = require('chai')
chai.should();
describe('convertRangeIndices', function () {
	it('should correctly convert various types of ranges', function (done) {
		convertRangeIndices({start: 9,end:0},{inclusive1BasedStart: true}).should.deep.equal({start: 8,end: 0})
		convertRangeIndices({start: 9,end:0},{inclusive1BasedStart: true}, {inclusive1BasedEnd: true}).should.deep.equal({start: 8,end: 1})
		convertRangeIndices({start: 9,end:0},{inclusive1BasedEnd: true}, {inclusive1BasedEnd: true}).should.deep.equal({start: 9,end: 0})
		convertRangeIndices({start: 4,end:5},{inclusive1BasedEnd: true}, {inclusive1BasedStart: true}).should.deep.equal({start: 5,end: 4})
		convertRangeIndices({ 
                start: '1',
                end: '28',
            }, 
            {inclusive1BasedStart: true, inclusive1BasedEnd: true}, 
            {})
            .should.deep.equal({start: 0,end: 27})
		done()
	});
    it('should not remove other attributes on the range object', function (done) {
    	convertRangeIndices({start: 4,end:5, someOtherAttribute: 'yay'},{inclusive1BasedEnd: true}, {inclusive1BasedStart: true})
            .should.deep.equal({start: 5,end: 4, someOtherAttribute: 'yay'})
		done()
	});
})
