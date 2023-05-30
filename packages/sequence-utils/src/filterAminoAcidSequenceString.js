// var ac = require('ve-api-check');
module.exports = function filterAminoAcidSequenceString(
  sequenceString,
  options
) {
  options = options || {};
  if (options.includeStopCodon) {
    //tnrtodo this maybe needs the stop codon char in it?
    return sequenceString.replace(/[^xtgalmfwkqespvicyhrndu.*]/gi, "");
  }
  // ac.throw(ac.string, sequenceString);
  return sequenceString.replace(/[^xtgalmfwkqespvicyhrndu]/gi, "");
};
