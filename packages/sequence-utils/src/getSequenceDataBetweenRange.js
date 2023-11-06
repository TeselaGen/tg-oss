import { flatMap, extend, forEach, startCase } from "lodash";
import { getRangeLength } from "@teselagen/range-utils";
import convertDnaCaretPositionOrRangeToAa from "./convertDnaCaretPositionOrRangeToAA";
import insertSequenceDataAtPosition from "./insertSequenceDataAtPosition";
import {
  getSequenceWithinRange,
  getZeroedRangeOverlaps
} from "@teselagen/range-utils";
import tidyUpSequenceData from "./tidyUpSequenceData";
import { annotationTypes } from "./annotationTypes";

export default function getSequenceDataBetweenRange(
  seqData,
  range,
  options = {}
) {
  if (!range) return seqData;
  const { exclude = {}, excludePartial = {} } = options;
  const seqDataToUse = tidyUpSequenceData(seqData, {
    doNotRemoveInvalidChars: true,
    ...options
  });
  annotationTypes.forEach(type => {
    delete seqDataToUse[`filtered${startCase(type)}`];
  });
  const seqDataToReturn = extend(
    {},
    seqDataToUse,
    {
      circular:
        seqDataToUse.sequence.length ===
        getRangeLength(range, seqData.sequence.length)
          ? seqDataToUse.circular
          : false,
      sequence: getSequenceWithinRange(range, seqDataToUse.sequence),
      proteinSequence: getSequenceWithinRange(
        convertDnaCaretPositionOrRangeToAa(range),
        seqDataToUse.proteinSequence
      )
    },
    annotationTypes.reduce((acc, type) => {
      if (exclude[type]) {
        acc[type] = [];
        return acc; //return early cause we're not interested in these annotations
      }
      acc[type] = getAnnotationsBetweenRange(
        seqDataToUse[type],
        range,
        seqDataToUse.sequence.length,
        excludePartial[type]
      );
      return acc;
    }, {})
  );
  if (range.overlapsSelf) {
    const extendedSeqData = insertSequenceDataAtPosition(
      { sequence: seqDataToReturn.sequence },
      seqDataToUse,
      range.start
    );

    const toRet = getSequenceDataBetweenRange(
      extendedSeqData,
      {
        start: range.end + 1,
        end: range.end
      },
      options
    );
    annotationTypes.forEach(type => {
      //we need to go through and adjust any anns where overlapsSelf=true to no longer overlap themselves if they match the range completely
      forEach(toRet[type], ann => {
        if (
          ann.overlapsSelf &&
          ann.start === 0 &&
          getRangeLength(ann, seqDataToUse.sequence.length) ===
            getRangeLength(range, seqDataToUse.sequence.length)
        ) {
          ann.overlapsSelf = false;
          ann.end = toRet.sequence.length - 1;
        }
      });
    });
    return tidyUpSequenceData(toRet, {
      doNotRemoveInvalidChars: true,
      ...options
    });
  }

  return tidyUpSequenceData(seqDataToReturn, {
    doNotRemoveInvalidChars: true,
    ...options
  });
}

function getAnnotationsBetweenRange(
  annotationsToBeAdjusted,
  range,
  maxLength,
  shouldExcludePartial
) {
  return flatMap(annotationsToBeAdjusted, annotation => {
    if (annotation.locations && annotation.locations.length) {
      annotation.locations = getAnnotationsBetweenRange(
        annotation.locations,
        range,
        maxLength,
        shouldExcludePartial
      );
    }
    //map through every annotation and get the overlap of the annotation with the range
    const overlaps = getZeroedRangeOverlaps(annotation, range, maxLength).map(
      overlap => {
        //we get back 1 or more overlaps here

        return extend({}, annotation, overlap);
      }
    );
    if (shouldExcludePartial) {
      if (overlaps.length > 1) return []; //the annotation has multiple overlaps and thus must be a partial copy so we exclude it completely
      if (overlaps[0]) {
        //there is just 1 overlap, if it doesn't have the same length, it must be a partial copy so we need to exclude it
        if (
          getRangeLength(overlaps[0], maxLength) !==
          getRangeLength(annotation, maxLength)
        ) {
          return [];
        }
      }
    }

    return overlaps;
  }).map(annotation => {
    if (annotation.locations && annotation.locations.length) {
      annotation.start = annotation.locations[0].start;
      annotation.end =
        annotation.locations[annotation.locations.length - 1].end;

      if (annotation.locations.length === 1) delete annotation.locations;
    }
    return annotation;
  }); //filter any fully deleted ranges
}
