const normalizeRange = require('./normalizeRange');
const expect = require('chai').expect
describe('normalizeRange', function () {
    it('should normalize range correctly', function() {
        const normalizedRange = normalizeRange({start: 0, end: -1},10)
        expect(normalizedRange.start).to.equal(0)
        expect(normalizedRange.end).to.equal(9)
    })
});