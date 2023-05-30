var assert = require('assert');
var getLengthOfOverlappingRegionsBetweenTwoRanges = require('./getLengthOfOverlappingRegionsBetweenTwoRanges');
describe('getLengthOfOverlappingRegionsBetweenTwoRanges', function () {
	it('should get the length of the overlaps in a simple case', function () {
		var length = getLengthOfOverlappingRegionsBetweenTwoRanges({
			start: 4,
			end: 8
		}, {
			start: 5,
			end: 10
		}, 20)
		assert.equal(length, 4)
	});
	it('should get the length of the overlaps', function () {
		var length = getLengthOfOverlappingRegionsBetweenTwoRanges({
			start: 4,
			end: 8
		}, {
			start: 7,
			end: 5
		}, 20)
		assert.equal(length, 4)
	});
});