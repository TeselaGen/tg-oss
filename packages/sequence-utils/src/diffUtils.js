const { cloneDeep, forEach } = require("lodash");
const tidyUpSequenceData = require("./tidyUpSequenceData");
const differ = require("jsondiffpatch").create({
  // cloneDiffValues: true
});

const getDiffFromSeqs = (oldData, newData, { ignoreKeys = [] } = {}) => {
  oldData = tidyUpSequenceData(oldData, {
    annotationsAsObjects: true,
    noTranslationData: true
  });
  newData = tidyUpSequenceData(newData, {
    annotationsAsObjects: true,
    noTranslationData: true
  });

  [oldData, newData].forEach(d => {
    [
      "cutsites",
      "orfs",
      "filteredFeatures",
      "size",
      "fromFileUpload",
      "description",
      "materiallyAvailable",
      ...ignoreKeys
    ].forEach(prop => {
      delete d[prop];
    });
    if (d.translations) {
      forEach(d.translations, (translation, key) => {
        if (
          translation.translationType &&
          translation.translationType !== "User Created"
        ) {
          delete d.translations[key];
        } else {
          delete translation.aminoAcids;
        }
      });
    }
  });

  return differ.diff(oldData, newData);
};
const patchSeqWithDiff = (oldData, diff, { ignoreKeys = [] } = {}) => {
  ignoreKeys.forEach(k => {
    delete diff[k];
  });
  return differ.patch(
    tidyUpSequenceData(cloneDeep(oldData), { annotationsAsObjects: true }),
    diff
  );
};
const reverseSeqDiff = diff => {
  return differ.reverse(diff);
};

module.exports = { getDiffFromSeqs, patchSeqWithDiff, reverseSeqDiff };
