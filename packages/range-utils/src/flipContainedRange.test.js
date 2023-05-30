/* eslint-disable no-var*/ 
var flipContainedRange = require('./flipContainedRange');
var chai = require('chai')
chai.should();

describe('flipContainedRange', function () {
	it('non origin spanning, fully contained inner', function () {
		var innerRange ={
			start: 5,
			end: 13
		}
		var outerRange = {
			start: 0,
			end:20
		}
		var sequenceLength = 40
		var flippedInnerRange = flipContainedRange(innerRange, outerRange, sequenceLength)
		flippedInnerRange.should.deep.equal({
			start: 7,
			end:15
		})
	});
	it('non origin spanning outer, origin spanning fully contained inner', function () {
		var innerRange ={
			start: 3,
			end: 1
		}
		var outerRange = {
			start: 0,
			end:3
		}
		var sequenceLength = 4
		var flippedInnerRange = flipContainedRange(innerRange, outerRange, sequenceLength)
		flippedInnerRange.should.deep.equal({
			start: 2,
			end:0
		})
	});
	it('origin spanning outer, non-origin spanning, fully contained inner', function () {
		var innerRange ={
			start: 1,
			end: 3
		}
		var outerRange = {
			start: 8,
			end:5
		}
		var sequenceLength = 10
		var flippedInnerRange = flipContainedRange(innerRange, outerRange, sequenceLength)
		flippedInnerRange.should.deep.equal({
			start: 0,
			end:2
		})
	});
	it('non-origin spanning outer, non-origin spanning, non-fully contained inner', function () {
		var innerRange ={
			start: 1,
			end: 4
		}
		var outerRange = {
			start: 3,
			end:6
		}
		var sequenceLength = 10
		var flippedInnerRange = flipContainedRange(innerRange, outerRange, sequenceLength)
		flippedInnerRange.should.deep.equal({
			start: 5,
			end:8
		})
	});
	it('non-origin spanning outer, non-origin spanning, non-fully contained inner', function () {
		var innerRange ={
			start: 4,
			end: 2
		}
		var outerRange = {
			start: 2,
			end:5
		}
		var sequenceLength = 10
		var flippedInnerRange = flipContainedRange(innerRange, outerRange, sequenceLength)
		flippedInnerRange.should.deep.equal({
			start: 5,
			end:3
		})
	});

	it('inner fully spans outer, does not wrap origin', function () {
		var innerRange ={
			start: 1,
			end: 7
		}
		var outerRange = {
			start: 2,
			end:5
		}
		var sequenceLength = 10
		var flippedInnerRange = flipContainedRange(innerRange, outerRange, sequenceLength)
		flippedInnerRange.should.deep.equal({
			start: 0,
			end:6
		})
	});

	it('inner fully spans outer, does wrap origin', function () {
		var innerRange ={
			start: 4,
			end: 2
		}
		var outerRange = {
			start: 5,
			end:2
		}
		var sequenceLength = 10
		var flippedInnerRange = flipContainedRange(innerRange, outerRange, sequenceLength)
		flippedInnerRange.should.deep.equal({
			start: 5,
			end:3
		})
	});

});

