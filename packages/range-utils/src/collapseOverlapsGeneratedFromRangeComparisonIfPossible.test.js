//const tap = require('tap');
//tap.mochaGlobals();

const getOverlapsOfPotentiallyCircularRanges = require('./getOverlapsOfPotentiallyCircularRanges.js');
const collapseOverlapsGeneratedFromRangeComparisonIfPossible = require('./collapseOverlapsGeneratedFromRangeComparisonIfPossible.js');
const assert = require('assert');
describe('collapseOverlapsGeneratedFromRangeComparisonIfPossible', function() {
    it('returns an empty array if passed an empty array of overlaps', function() {
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible([], 1000), []);
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible(getOverlapsOfPotentiallyCircularRanges({
            start: 900,
            end: 100
        }, {
            start: 900,
            end: 100
        }, 1000), 1000), [{
            start: 900,
            end: 100
        }]);
    });
    it('collapses a split circular range', function() {
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible([{
            start: 0,
            end: 100
        }, {
            start: 105,
            end: 999
        }], 1000), [{
            start: 105,
            end: 100
        }]);
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible(getOverlapsOfPotentiallyCircularRanges({
            start: 900,
            end: 100
        }, {
            start: 900,
            end: 100
        }, 1000), 1000), [{
            start: 900,
            end: 100
        }]);
    });
    it('doesnt collapses a split range that could be circular if the originalRangeIsNotCircular', function() {
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible([{
            start: 0,
            end: 100
        }, {
            start: 105,
            end: 999
        }], 1000, {
            start: 0,
            end: 999
        }), [{
            start: 0,
            end: 100
        }, {
            start: 105,
            end: 999
        }]);
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible(getOverlapsOfPotentiallyCircularRanges({
            start: 900,
            end: 100
        }, {
            start: 900,
            end: 100
        }, 1000), 1000), [{
            start: 900,
            end: 100
        }]);
    });
    it('doesnt collapses a split range that doesnt line up correctly', function() {
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible([{
            start: 0,
            end: 100
        }, {
            start: 105,
            end: 998
        }], 1000),[{
            start: 0,
            end: 100
        }, {
            start: 105,
            end: 998
        }]);
    });
    it('collapses a split circular range with a third part', function() {
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible([{
            start: 200,
            end: 300
        },{
            start: 0,
            end: 100
        }, {
            start: 500,
            end: 999
        }], 1000), [{
            start: 500,
            end: 100
        },{
            start: 200,
            end: 300
        }]);
    });

    it('collapses a split circular range with a third part in a different order', function() {
        assert.deepEqual(collapseOverlapsGeneratedFromRangeComparisonIfPossible([{
            start: 0,
            end: 100
        },{
            start: 200,
            end: 300
        }, {
            start: 500,
            end: 999
        }], 1000), [{
            start: 500,
            end: 100
        },{
            start: 200,
            end: 300
        }]);
    });
});