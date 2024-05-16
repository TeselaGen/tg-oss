import { getRangeLength, Range } from "@teselagen/range-utils";
import { map, cloneDeep } from "lodash";
import convertDnaCaretPositionOrRangeToAa from "./convertDnaCaretPositionOrRangeToAA";
import rotateSequenceDataToPosition from "./rotateSequenceDataToPosition";
import { adjustRangeToDeletionOfAnotherRange } from "@teselagen/range-utils";
import tidyUpSequenceData from "./tidyUpSequenceData";
import { modifiableTypes } from "./annotationTypes";
import adjustBpsToReplaceOrInsert from "./adjustBpsToReplaceOrInsert";
import adjustAnnotationsToInsert from "./adjustAnnotationsToInsert";
import {
  Annotation,
  CaretPositionOrRange,
  ChromatogramData,
  SequenceData
} from "./sequence-utils-types"; // Import the SequenceData type from the appropriate file

type InsertSequenceDataAtPositionOrRangeOpts = {
  maintainOriginSplit?: boolean;
};
export default function insertSequenceDataAtPositionOrRange(
  _sequenceDataToInsert: SequenceData, // Replace 'any' with the specific type for _sequenceDataToInsert
  _existingSequenceData: SequenceData,
  caretPositionOrRange: CaretPositionOrRange, // Replace 'any' with the specific type for caretPositionOrRange
  options: InsertSequenceDataAtPositionOrRangeOpts = {}
): SequenceData {
  const range: Range =
    typeof caretPositionOrRange === "object"
      ? caretPositionOrRange
      : { start: -1, end: -1 };

  const caret =
    typeof caretPositionOrRange === "number" ? caretPositionOrRange : -1;
  //maintainOriginSplit means that if you're inserting around the origin with n bps selected before the origin
  //when inserting new seq, n bps of the new seq should go in before the origin and the rest should be
  //inserted at the sequence start
  const { maintainOriginSplit } = options;
  let existingSequenceData = tidyUpSequenceData(_existingSequenceData, {
    doNotRemoveInvalidChars: true,
    ...options
  });
  const sequenceDataToInsert = tidyUpSequenceData(_sequenceDataToInsert, {
    topLevelSeqData: existingSequenceData,
    ...options
  });
  const newSequenceData = cloneDeep(existingSequenceData);
  const insertLength = sequenceDataToInsert.proteinSequence
    ? sequenceDataToInsert.proteinSequence.length * 3
    : sequenceDataToInsert.sequence.length;
  let caretPosition = caretPositionOrRange;

  const isInsertSameLengthAsSelection =
    sequenceDataToInsert.sequence.length ===
    getRangeLength(range, existingSequenceData.sequence.length);

  if (
    typeof caretPositionOrRange === "object" &&
    caretPositionOrRange.start > -1 &&
    getRangeLength(
      caretPositionOrRange,
      existingSequenceData.sequence.length
    ) === existingSequenceData.sequence.length
  ) {
    //handle the case where we're deleting everything!
    existingSequenceData = tidyUpSequenceData(
      {
        ...existingSequenceData,
        ...modifiableTypes.reduce((acc, type) => {
          return { ...acc, [type]: [] };
        }, {}),
        sequence: "",
        doNotRemoveInvalidChars: true,
        proteinSequence: "",
        chromatogramData: undefined
      },
      options
    );
    newSequenceData.chromatogramData = undefined;
  } else if (
    newSequenceData.chromatogramData &&
    newSequenceData.chromatogramData.baseTraces
  ) {
    //handle chromatogramData updates
    if (range.start > -1) {
      if (range.start > range.end) {
        newSequenceData.chromatogramData = trimChromatogram({
          chromatogramData: newSequenceData.chromatogramData,
          range: {
            start: range.start,
            end: newSequenceData.sequence.length
          },
          justBaseCalls: isInsertSameLengthAsSelection
        });
        newSequenceData.chromatogramData = trimChromatogram({
          chromatogramData: newSequenceData.chromatogramData,
          range: {
            start: 0,
            end: range.end
          },
          justBaseCalls: isInsertSameLengthAsSelection
        });
      } else {
        newSequenceData.chromatogramData = trimChromatogram({
          chromatogramData: newSequenceData.chromatogramData,
          range: {
            start: range.start,
            end: range.end
          },
          justBaseCalls: isInsertSameLengthAsSelection
        });
      }
    }
    if (sequenceDataToInsert.sequence) {
      if (range.start > -1) {
        insertIntoChromatogram({
          chromatogramData: newSequenceData.chromatogramData,
          caretPosition: range.start,
          seqToInsert: sequenceDataToInsert.sequence,
          justBaseCalls: isInsertSameLengthAsSelection
        });
      } else {
        insertIntoChromatogram({
          chromatogramData: newSequenceData.chromatogramData,
          caretPosition: caret,
          seqToInsert: sequenceDataToInsert.sequence,
          justBaseCalls: isInsertSameLengthAsSelection
        });
      }
    }
  }

  //update the sequence
  newSequenceData.sequence = adjustBpsToReplaceOrInsert(
    existingSequenceData.sequence,
    sequenceDataToInsert.sequence,
    caretPositionOrRange
  );
  newSequenceData.size = newSequenceData.sequence.length;
  newSequenceData.proteinSequence = adjustBpsToReplaceOrInsert(
    existingSequenceData.proteinSequence,
    sequenceDataToInsert.proteinSequence,
    convertDnaCaretPositionOrRangeToAa(caretPositionOrRange)
  );
  newSequenceData.proteinSize = newSequenceData.proteinSequence.length;

  //handle the insert
  modifiableTypes.forEach(annotationType => {
    let existingAnnotations = existingSequenceData[annotationType];
    //update the annotations:
    //handle the delete if necessary
    if (range.start > -1) {
      //we have a range! so let's delete it!
      caretPosition = range.start > range.end ? 0 : range.start;
      //update all annotations for the deletion
      existingAnnotations = adjustAnnotationsToDelete(
        existingAnnotations,
        range,
        existingSequenceData.sequence.length
      );
    }
    //first clear the newSequenceData's annotations
    newSequenceData[annotationType] = [];
    //in two steps adjust the annotations to the insert
    newSequenceData[annotationType] = newSequenceData[annotationType].concat(
      adjustAnnotationsToInsert(
        existingAnnotations,
        caretPosition,
        insertLength
      )
    );
    newSequenceData[annotationType] = newSequenceData[annotationType].concat(
      adjustAnnotationsToInsert(
        sequenceDataToInsert[annotationType],
        0,
        caretPosition
      )
    );
  });
  if (maintainOriginSplit && caret === -1 && range.start > range.end) {
    //we're replacing around the origin and maintainOriginSplit=true
    //so rotate the resulting seqData n bps
    const caretPosToRotateTo =
      existingSequenceData.sequence.length - range.start;
    return rotateSequenceDataToPosition(
      newSequenceData,
      Math.min(caretPosToRotateTo, insertLength)
    );
  }
  return newSequenceData;
}

function adjustAnnotationsToDelete(
  annotationsToBeAdjusted: Annotation[],
  range: { start: number; end: number },
  maxLength: number
) {
  return map(annotationsToBeAdjusted, (annotation: Annotation) => {
    const newRange = adjustRangeToDeletionOfAnotherRange(
      annotation,
      range,
      maxLength
    );
    const newLocations =
      annotation.locations &&
      annotation.locations.flatMap((loc: Range): Range | [] => {
        const newR = adjustRangeToDeletionOfAnotherRange(loc, range, maxLength);
        if (newR) {
          return newR;
        }
        return [];
      });
    if (newLocations && newLocations.length) {
      return {
        ...newRange,
        start: newLocations[0].start,
        end: newLocations[newLocations.length - 1].end,
        ...(newLocations.length > 1 && { locations: newLocations })
      };
    } else {
      return newRange;
    }
  }).filter(
    (
      range: Range | { locations?: Range[]; start: number; end: number } | null
    ): range is Range => !!range
  );
}

function insertIntoChromatogram({
  chromatogramData,
  caretPosition,
  seqToInsert,
  justBaseCalls
}: {
  chromatogramData: ChromatogramData;
  caretPosition: number;
  seqToInsert: string;
  justBaseCalls: boolean;
}): ChromatogramData | undefined {
  if (!seqToInsert.length) return;

  chromatogramData.baseCalls &&
    chromatogramData.baseCalls.splice(
      caretPosition,
      0,
      ...seqToInsert.split("")
    );
  if (justBaseCalls) {
    //return early if just base calls
    return chromatogramData;
  }

  const baseTracesToInsert = [];
  const qualNumsToInsert = [];

  for (let index = 0; index < seqToInsert.length; index++) {
    qualNumsToInsert.push(0);
    const toPush = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    baseTracesToInsert.push({
      aTrace: toPush,
      cTrace: toPush,
      gTrace: toPush,
      tTrace: toPush
    });
  }

  chromatogramData.baseTraces &&
    chromatogramData.baseTraces.splice(caretPosition, 0, ...baseTracesToInsert);
  chromatogramData.qualNums &&
    chromatogramData.qualNums.splice(caretPosition, 0, ...qualNumsToInsert);

  return chromatogramData;
}

function trimChromatogram({
  chromatogramData,
  range: { start, end },
  justBaseCalls
}: {
  chromatogramData: ChromatogramData;
  range: { start: number; end: number };
  justBaseCalls: boolean;
}): ChromatogramData {
  [
    "baseCalls",
    ...(justBaseCalls ? [] : ["qualNums", "baseTraces", "basePos"])
  ].forEach(type => {
    if (Array.isArray(chromatogramData[type])) {
      (chromatogramData[type] as unknown[]).splice(start, end - start + 1);
    }
  });

  return chromatogramData;
}
