import { cloneDeep, forEach } from "lodash";
import { diff, patch, reverse } from "jsondiffpatch/dist/jsondiffpatch.umd";

import tidyUpSequenceData from "./tidyUpSequenceData";

const getDiffFromSeqs = (oldData, newData, { ignoreKeys = [] } = {}) => {
  oldData = tidyUpSequenceData(oldData, {
    annotationsAsObjects: true,
    noTranslationData: true,
    doNotRemoveInvalidChars: true
  });
  newData = tidyUpSequenceData(newData, {
    annotationsAsObjects: true,
    noTranslationData: true,
    doNotRemoveInvalidChars: true
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

  return diff(oldData, newData);
};
const patchSeqWithDiff = (oldData, diff, { ignoreKeys = [] } = {}) => {
  ignoreKeys.forEach(k => {
    delete diff[k];
  });
  return patch(
    tidyUpSequenceData(cloneDeep(oldData), {
      annotationsAsObjects: true,
      doNotRemoveInvalidChars: true
    }),
    diff
  );
};
const reverseSeqDiff = diff => {
  return reverse(diff);
};

export { getDiffFromSeqs, patchSeqWithDiff, reverseSeqDiff };
