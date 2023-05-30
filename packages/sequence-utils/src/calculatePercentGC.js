module.exports = function calculatePercentGC(bps) {
  return (bps.match(/[cg]/gi) || []).length / bps.length * 100 || 0;
};
