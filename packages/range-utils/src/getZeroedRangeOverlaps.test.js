const assert = require('assert');
const getZeroedRangeOverlaps = require('./getZeroedRangeOverlaps')
describe('getZeroedRangeOverlaps', function() {
    it('annotation non-circular, selection non circular ', function() {
        const res = getZeroedRangeOverlaps({start: 0, end: 3}, {start: 2, end: 3}, 4, true, true) 
        assert.deepEqual(res, [{start: 0, end:1}])
    })
    it('annotation non circular, selection circular', function() {
      //01234
      //aaaa 
      //s sss
        const res = getZeroedRangeOverlaps({start: 0, end: 3}, {start: 2, end: 0}, 5, true, true) 
        assert.deepEqual(res, [ {start: 3,end: 3}, {start: 0, end:1}])
    })
    it('annotation non circular, selection circular 2', function() {
      //0123
      //aaaa
      //ssss 
        const res = getZeroedRangeOverlaps({start: 0, end: 3}, {start: 2, end: 1}, 4, true, true) 
        assert.deepEqual(res, [ {start: 2,end: 3}, {start: 0, end:1},])
    })
    it('annotation circular, selection fully containing', function() {
      //01234
      //aa aa
      //sssss 
        const res = getZeroedRangeOverlaps({start: 3, end: 1}, {start: 0, end: 4}, 5, true, true) 
        assert.deepEqual(res, [{start: 3, end: 1}])
    })
    it('annotation circular, selection fully containing 2', function() {
      //01234
      //aa aa
      //sssss 
        const res = getZeroedRangeOverlaps({start: 3, end: 1}, {start: 1, end: 0}, 5, true, true) 
        assert.deepEqual(res, [{start: 2, end: 4}, {start: 0, end: 0}])
    })
})