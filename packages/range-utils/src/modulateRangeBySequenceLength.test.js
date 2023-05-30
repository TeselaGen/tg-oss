var expect = require('chai').expect
var modulateRangeBySequenceLength = require('./modulateRangeBySequenceLength')
describe('modulateRangeBySequenceLength', function() {
    it('should modulate ranges that are outside of the sequence length', function() {
        //agtc
        //0123
        expect(modulateRangeBySequenceLength({start: 2, end: 5},4)).to.deep.equal({start: 2, end:1})
        expect(modulateRangeBySequenceLength({start: 2, end: 4},4)).to.deep.equal({start: 2, end:0})
        //agtc
        //12345
        expect(modulateRangeBySequenceLength({start: 2, end: 4},4,{inclusive1BasedEnd: true})).to.deep.equal({start: 2, end:4})
        expect(modulateRangeBySequenceLength({start: 2, end: 4},4,{inclusive1BasedEnd: true,inclusive1BasedStart: true})).to.deep.equal({start: 2, end:4})
        expect(modulateRangeBySequenceLength({start: 5, end: 4},4,{inclusive1BasedEnd: true,inclusive1BasedStart: true})).to.deep.equal({start: 1, end:4})
        expect(modulateRangeBySequenceLength({start: 5, end: 5},4,{inclusive1BasedEnd: true,inclusive1BasedStart: true})).to.deep.equal({start: 1, end:1})
    })
})
