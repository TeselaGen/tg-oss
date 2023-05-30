import getRangeLength from './getRangeLength';
import generateRandomRange from './generateRandomRange';
import chai from 'chai';
chai.should();

describe('generateRandomRange', function () {
	it('should generate random ranges between a start and end', function () {
		for (let i = 0; i < 1000; i++) {
			const range = generateRandomRange(0,10);
			range.start.should.be.below(11)
			range.end.should.be.below(11)
		}
	});

	it('should generate random ranges between a start and end and with length less than maxLength', function () {
		for (let i = 0; i < 1000; i++) {
			const range = generateRandomRange(0,10,5);
			const length = getRangeLength(range);
			if (length > -1) {
				length.should.be.below(6)
			}
		}
	});
});