

import {expect} from 'chai';

import zeroSubrangeByContainerRange from './zeroSubrangeByContainerRange.js';
describe('zeroSubrangeByContainerRange', function() {
    it('throws an error if circular subRange does not fit within container range', function() {
        let error = false;
        try {
            zeroSubrangeByContainerRange({
                start: 20,
                end: 10
            }, {
                start: 10,
                end: 20
            }, 30);
        } catch (e) {
            error = true;
        }
        expect(error).to.be.true;
    });
    it('throws an error if non circular subRange does not fit within container range', function() {
        let error = false;
        try {
            zeroSubrangeByContainerRange({
                start: 9,
                end: 20
            }, {
                start: 10,
                end: 20
            }, 30);
        } catch (e) {
            error = true;
        }
        expect(error).to.be.true;
    });
    it('zeros non circular range if fully overlapped', function() {
        const zeroedSubrange = zeroSubrangeByContainerRange({
            start: 10,
            end: 20
        }, {
            start: 10,
            end: 20
        }, 30);

        expect(zeroedSubrange).to.deep.equal({
            start: 0,
            end: 10
        });
    });
});
