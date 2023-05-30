const rotateBpsToPosition = require('./rotateBpsToPosition')
describe('rotateBpsToPosition', function() {
    it('should rotate Bps To Position correctly ', function() {
        expect(rotateBpsToPosition("atgaccc",4)).toEqual("cccatga")
    })
})