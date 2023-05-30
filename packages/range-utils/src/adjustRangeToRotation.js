// const ac = require('ve-api-check');
const { assign } = require("lodash");
const {identity} = require('lodash');

module.exports = function adjustRangeToRotation(
  rangeToBeAdjusted,
  rotateTo = 0,
  rangeLength
) {
  // ac.throw([ac.range, ac.posInt, ac.posInt], arguments);
  const mod = rangeLength ? modulo : identity 

  const newRange = assign({}, rangeToBeAdjusted, {
    start: mod(rangeToBeAdjusted.start - (rotateTo || 0), rangeLength),
    end: mod(rangeToBeAdjusted.end - (rotateTo || 0), rangeLength)
  });

  return newRange;
};

function modulo(n, m) {
  return ((n % m) + m) % m;
}
