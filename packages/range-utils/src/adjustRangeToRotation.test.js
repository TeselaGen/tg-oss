//const tap = require('tap');
//tap.mochaGlobals();

const adjustRangeToRotation = require('./adjustRangeToRotation.js');
const assert = require('assert');
describe('adjustRangeToRotation', function() {
    it('defaults to a rotateBy=0 if a null or undefined is passed ', () => {
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, null, 10), {
            start: 1,
            end: 2
        });
        
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, undefined, 10), {
            start: 1,
            end: 2
        });
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, NaN, 10), {
            start: 1,
            end: 2
        });

    });
    it('defaults to an infinite length if no length is passed', () => {
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, 1, null), {
            start: 0,
            end: 1
        });
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, 1, undefined), {
            start: 0,
            end: 1
        });
        
        

    });
    it('shifts start and end if rotating before non circular range', function() {
        //0123456789
        //atgcatgccc
        // rr
        // 
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, 1, 10), {
            start: 0,
            end: 1
        });
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, undefined, 10), {
            start: 1,
            end: 2
        });
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, 2, 10), {
            start: 9,
            end: 0
        });
        assert.deepEqual(adjustRangeToRotation({
            start: 1,
            end: 2
        }, 3, 10), {
            start: 8,
            end: 9
        });
        //0123456789
        //atgcatgccc
        //rrrrr  rrr
        // 
        assert.deepEqual(adjustRangeToRotation({
            start: 7,
            end: 4
        }, 3, 10), {
            start: 4,
            end: 1
        });
        assert.deepEqual(adjustRangeToRotation({
            start: 7,
            end: 4
        }, 5, 10), {
            start: 2,
            end: 9
        });
        assert.deepEqual(adjustRangeToRotation({
            start: 7,
            end: 4
        }, 6, 10), {
            start: 1,
            end: 8
        });
        //0123456 789
        //atgcatg ccc
        //rrrrrrr rrr
        // 
        assert.deepEqual(adjustRangeToRotation({
            start: 7,
            end: 6
        }, 3, 10), {
            start: 4,
            end: 3
        });
    });
    
});