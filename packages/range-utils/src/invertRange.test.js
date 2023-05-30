
var invertRange = require('./invertRange');
var chai = require('chai')
chai.should();
describe('invertRange', function () {
	it('should invert a non-circular range', function () {
		var invertedRange = invertRange({start: 2, end:2}, 10);
		invertedRange.start.should.equal(3)
		invertedRange.end.should.equal(1)
	});
	it('should invert a non-circular range', function () {
		var invertedRange = invertRange({start: 0, end:2}, 10);
		invertedRange.start.should.equal(3)
		invertedRange.end.should.equal(9)
	});
	it('should invert a non-circular range', function () {
		var invertedRange = invertRange({start: 0, end:9}, 10);
		invertedRange.start.should.equal(0)
		invertedRange.end.should.equal(9)
	});
	it('should invert a non-circular range', function () {
		var invertedRange = invertRange({start: 4, end:9}, 10);
		invertedRange.start.should.equal(0)
		invertedRange.end.should.equal(3)
	});
	it('should invert a circular range', function () {
		var invertedRange = invertRange({start: 3, end:1}, 10);
		invertedRange.start.should.equal(2)
		invertedRange.end.should.equal(2)
	});
	it('should invert a circular range', function () {
		var invertedRange = invertRange({start: 9, end:1}, 10);
		invertedRange.start.should.equal(2)
		invertedRange.end.should.equal(8)
	});
	it('should invert a circular range', function () {
		var invertedRange = invertRange({start: 3, end:0}, 10);
		invertedRange.start.should.equal(1)
		invertedRange.end.should.equal(2)
	});
	it('should handle inverting a whole range by returning the original range', function () {
		var invertedRange = invertRange({start: 4, end:3}, 10);
		invertedRange.start.should.equal(4)
		invertedRange.end.should.equal(3)
	});
	it('should handle inverting a caret position', function () {
		var invertedRange = invertRange(1, 10);
		invertedRange.start.should.equal(1)
		invertedRange.end.should.equal(0)
	});
	it('should handle inverting a caret position', function () {
		var invertedRange = invertRange(0, 10);
		invertedRange.start.should.equal(0)
		invertedRange.end.should.equal(9)
	});
	//tnrtodo: maybe one day we'll want to handle the "entire range" case in a special way, but for now we'll just return the original range
	// it('should handle inverting a whole range by setting the start and end to -1', function () {
	// 	var invertedRange = invertRange({start: 4, end:3}, 10);
	// 	invertedRange.start.should.equal(-1)
	// 	invertedRange.end.should.equal(-1)
	// });
});
describe('invertRange should handle options inclusive1BasedEnd or inclusive1BasedStart', function () {
	it('should handle inverting a whole range by returning the original range', function () {
		var options = {inclusive1BasedEnd: true}
		var invertedRange = invertRange({start: 2, end:2}, 10, options);
		invertedRange.start.should.equal(2)
		invertedRange.end.should.equal(2)
	});
	it('should invert a non-circular range', function () {
		var options = {inclusive1BasedEnd: true}
		var invertedRange = invertRange({start: 0, end:2}, 10, options);
		invertedRange.start.should.equal(2)
		invertedRange.end.should.equal(10)
	});
	it('should invert non-circular range 1', function () {
		var invertedRange = invertRange({start: 0, end:9}, 10,{inclusive1BasedEnd: true});
		invertedRange.start.should.equal(9)
		invertedRange.end.should.equal(10)
	});
	it('should invert a non-circular range 2', function () {
		var invertedRange = invertRange({start: 1, end:9}, 10,{inclusive1BasedEnd: true,inclusive1BasedStart: true});
		invertedRange.start.should.equal(10)
		invertedRange.end.should.equal(10)
	});
	it('should invert a non-circular range 3', function () {
		var invertedRange = invertRange({start: 3, end:6}, 10,{inclusive1BasedEnd: true,inclusive1BasedStart: true});
		invertedRange.start.should.equal(7)
		invertedRange.end.should.equal(2)
	});
	it('should invert a circular range 4', function () {
		var invertedRange = invertRange({start: 6, end:3}, 10,{inclusive1BasedEnd: true,inclusive1BasedStart: true});
		invertedRange.start.should.equal(4)
		invertedRange.end.should.equal(5)
	});
});
