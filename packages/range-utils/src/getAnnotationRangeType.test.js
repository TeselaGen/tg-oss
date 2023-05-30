var getAnnotationRangeType = require('./getAnnotationRangeType');
var chai = require('chai')
chai.should();

describe('getAnnotationRangeType', function () {
    it('should get the correct sub range type give a sub range and its enclosing range', function () {
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 4, end: 7}, 
            true
        ).should.equal('beginningAndEnd')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 4, end: 7}, 
            false
        ).should.equal('beginningAndEnd')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 4, end: 8}, 
            true
        ).should.equal('start')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 4, end: 8}, 
            false
        ).should.equal('end')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 3, end: 8}, 
            true
        ).should.equal('middle')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 3, end: 8}, 
            false
        ).should.equal('middle')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 3, end: 1}, 
            true
        ).should.equal('middle')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 3, end: 2}, 
            false
        ).should.equal('middle')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 4, end: 1}, 
            true
        ).should.equal('start')
        getAnnotationRangeType(
            {start: 4, end: 7}, 
            {start: 9, end: 7}, 
            false
        ).should.equal('start')

    });
});