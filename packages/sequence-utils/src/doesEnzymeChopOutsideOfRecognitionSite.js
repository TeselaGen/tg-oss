module.exports = function doesEnzymeChopOutsideOfRecognitionSite(enzyme) {
  if (
    enzyme.topSnipOffset > enzyme.site.length ||
    enzyme.bottomSnipOffset > enzyme.site.length
  ) {
    return true;
  } else {
    return false;
  }
};
