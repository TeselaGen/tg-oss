// this is throwing a weird eslint error

//
export default function filterSequenceString(
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
