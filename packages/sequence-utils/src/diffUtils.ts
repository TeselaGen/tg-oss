import { cloneDeep, forEach } from "lodash-es";
import { diff, patch, reverse, Delta } from "jsondiffpatch";
import { SequenceData } from "./types";

import tidyUpSequenceData from "./tidyUpSequenceData";

interface DiffOptions {
  ignoreKeys?: string[];
}

const getDiffFromSeqs = (
  oldData: SequenceData,
  newData: SequenceData,
  { ignoreKeys = [] }: DiffOptions = {}
): Delta | undefined => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const cleanedOldData: any = tidyUpSequenceData(oldData, {
    annotationsAsObjects: true,
    noTranslationData: true,
    doNotRemoveInvalidChars: true
  });
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const cleanedNewData: any = tidyUpSequenceData(newData, {
    annotationsAsObjects: true,
    noTranslationData: true,
    doNotRemoveInvalidChars: true
  });

  [cleanedOldData, cleanedNewData].forEach(d => {
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

  return diff(cleanedOldData, cleanedNewData);
};

const patchSeqWithDiff = (
  oldData: SequenceData,
  diffData: Delta,
  { ignoreKeys = [] }: DiffOptions = {}
): SequenceData => {
  ignoreKeys.forEach(k => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (diffData as any)[k];
  });
  const tidyOld = tidyUpSequenceData(cloneDeep(oldData), {
    annotationsAsObjects: true,
    doNotRemoveInvalidChars: true
  });

  return patch(tidyOld, diffData) as SequenceData;
};

const reverseSeqDiff = (diffData: Delta): Delta | undefined => {
  return reverse(diffData);
};

export { getDiffFromSeqs, patchSeqWithDiff, reverseSeqDiff };
