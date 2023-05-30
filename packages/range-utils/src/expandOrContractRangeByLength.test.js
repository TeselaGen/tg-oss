var expandOrContractRangeByLength = require('./expandOrContractRangeByLength');
var chai = require('chai')
var expect = chai.expect
chai.should();

describe('expandOrContractRangeByLength', function () {
	it('shift start by 1 ', function () {
		var expandedRange = expandOrContractRangeByLength({start: 3,end:4}, 1, true, 10)
		expandedRange.should.deep.equal({
			start: 2,
			end: 4
		})
	});
	it('shift end by 1 ', function () {
		var expandedRange = expandOrContractRangeByLength({start: 3,end:4}, 1, false, 10)
		expandedRange.should.deep.equal({
			start: 3,
			end: 5
		})
	});
	it('shift end by 6 ', function () {
		var expandedRange = expandOrContractRangeByLength({start: 3,end:4}, 6, false, 10)
		expandedRange.should.deep.equal({
			start: 3,
			end: 0
		})
	});

	it('circular range', function () {
		var expandedRange = expandOrContractRangeByLength({start: 6,end:4}, 1, false, 10)
		expandedRange.should.deep.equal({
			start: 6,
			end: 5
		})
	});
	it('circular range', function () {
		var expandedRange = expandOrContractRangeByLength({start: 6,end:4}, 1, true, 10)
		expandedRange.should.deep.equal({
			start: 5,
			end: 4
		})
	});
	it('circular range', function () {
		var expandedRange = expandOrContractRangeByLength({start: 6,end:4}, 1, true, 10)
		expandedRange.should.deep.equal({
			start: 5,
			end: 4
		})
	});

	it('negative shiftBy', function () {
		var expandedRange = expandOrContractRangeByLength({start: 6,end:4}, -1, true, 10)
		expandedRange.should.deep.equal({
			start: 7,
			end: 4
		})
	});
	it('negative shiftBy', function () {
		var expandedRange = expandOrContractRangeByLength({start: 6,end:4}, -1, false, 10)
		expandedRange.should.deep.equal({
			start: 6,
			end: 3
		})
	});

	// it('should error if trying to expand more than possible', function () {
	// 	var error = false;
	// 	try {
	// 		var range = expandOrContractRangeByLength({start: 6,end:4}, 10, false, 10)
	// 		console.log('range:', range)
	// 	} catch (e) {
	// 	    error = true;
	// 	}
	// 	expect(error).to.be.true;
	// });
});

