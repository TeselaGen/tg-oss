// this is throwing a weird eslint error

// var ac = require('ve-api-check');
module.exports = function filterSequenceString(
  sequenceString,
  additionalValidChars = "",
  charOverrides
) {
  // ac.throw(ac.string,sequenceString);
  if (sequenceString) {
    return sequenceString.replace(
      new RegExp(
        `[^${charOverrides ||
          `atgcyrswkmbvdhnu${additionalValidChars.split("").join("\\")}`}]`,
        "gi"
      ),
      ""
    );
  } else {
    return sequenceString;
  }
};
