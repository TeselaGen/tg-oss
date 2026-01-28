import { getRangeLength, Range } from "@teselagen/range-utils";
import { map, cloneDeep } from "lodash-es";
import convertDnaCaretPositionOrRangeToAa from "./convertDnaCaretPositionOrRangeToAA";
import rotateSequenceDataToPosition from "./rotateSequenceDataToPosition";
import { adjustRangeToDeletionOfAnotherRange } from "@teselagen/range-utils";
import tidyUpSequenceData from "./tidyUpSequenceData";
import { modifiableTypes } from "./annotationTypes";
import adjustBpsToReplaceOrInsert from "./adjustBpsToReplaceOrInsert";
import adjustAnnotationsToInsert from "./adjustAnnotationsToInsert";
import { Annotation, ChromatogramData, SequenceData } from "./types";

interface InsertSequenceDataOptions {
  maintainOriginSplit?: boolean;
  doNotRemoveInvalidChars?: boolean;
  topLevelSeqData?: SequenceData;
  [key: string]: unknown;
}

export default function insertSequenceDataAtPositionOrRange(
  _sequenceDataToInsert: SequenceData,
  _existingSequenceData: SequenceData,
  caretPositionOrRange: number | Range,
  options: InsertSequenceDataOptions = {}
): SequenceData {
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
  const insertLength =
    sequenceDataToInsert.isProtein && sequenceDataToInsert.proteinSequence
      ? sequenceDataToInsert.proteinSequence.length * 3
      : sequenceDataToInsert.sequence.length;
  let caretPosition =
    typeof caretPositionOrRange === "number"
      ? caretPositionOrRange
      : caretPositionOrRange.start;

  const isInsertSameLengthAsSelection =
    typeof caretPositionOrRange !== "number" &&
    sequenceDataToInsert.sequence.length ===
      getRangeLength(
        caretPositionOrRange,
        existingSequenceData.sequence.length
      );

  if (
    typeof caretPositionOrRange !== "number" &&
    caretPositionOrRange.start > -1 &&
    getRangeLength(
      caretPositionOrRange,
      existingSequenceData.sequence.length
    ) === existingSequenceData.sequence.length
  ) {
    //handle the case where we're deleting everything!
    const emptyAnnotations = modifiableTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, Annotation[]>
    );

    existingSequenceData = tidyUpSequenceData(
      {
        ...existingSequenceData,
        ...emptyAnnotations,
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
    if (
      typeof caretPositionOrRange !== "number" &&
      caretPositionOrRange.start > -1
    ) {
      if (caretPositionOrRange.start > caretPositionOrRange.end) {
        newSequenceData.chromatogramData = trimChromatogram({
          chromatogramData: newSequenceData.chromatogramData,
          range: {
            start: caretPositionOrRange.start,
            end: newSequenceData.sequence.length
          },
          justBaseCalls: isInsertSameLengthAsSelection
        });
        if (newSequenceData.chromatogramData) {
          newSequenceData.chromatogramData = trimChromatogram({
            chromatogramData: newSequenceData.chromatogramData,
            range: {
              start: 0,
              end: caretPositionOrRange.end
            },
            justBaseCalls: isInsertSameLengthAsSelection
          });
        }
      } else {
        newSequenceData.chromatogramData = trimChromatogram({
          chromatogramData: newSequenceData.chromatogramData,
          range: {
            start: caretPositionOrRange.start,
            end: caretPositionOrRange.end
          },
          justBaseCalls: isInsertSameLengthAsSelection
        });
      }
    }
    if (sequenceDataToInsert.sequence && newSequenceData.chromatogramData) {
      insertIntoChromatogram({
        chromatogramData: newSequenceData.chromatogramData,
        caretPosition:
          typeof caretPositionOrRange !== "number" &&
          caretPositionOrRange.start > -1
            ? caretPositionOrRange.start
            : (caretPositionOrRange as number),
        seqToInsert: sequenceDataToInsert.sequence,
        justBaseCalls: isInsertSameLengthAsSelection
      });
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
    existingSequenceData.proteinSequence || "",
    sequenceDataToInsert.proteinSequence || "",
    convertDnaCaretPositionOrRangeToAa(caretPositionOrRange)
  );
  newSequenceData.proteinSize = (newSequenceData.proteinSequence || "").length;

  //handle the insert
  modifiableTypes.forEach(annotationType => {
    let existingAnnotations = existingSequenceData[
      annotationType
    ] as Annotation[];
    if (!existingAnnotations) return;

    //update the annotations:
    //handle the delete if necessary
    if (
      typeof caretPositionOrRange !== "number" &&
      caretPositionOrRange.start > -1
    ) {
      //we have a range! so let's delete it!
      const range = caretPositionOrRange;
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
    const annotationsToInsert = sequenceDataToInsert[
      annotationType
    ] as Annotation[];
    //in two steps adjust the annotations to the insert
    if (newSequenceData[annotationType]) {
      // Explicitly cast to unknown array inside concat to avoid TS errors with specific Annotation types if they diverge slightly,
      // though strictly they should be Annotation[]
      (newSequenceData[annotationType] as Annotation[]) = (
        newSequenceData[annotationType] as Annotation[]
      ).concat(
        adjustAnnotationsToInsert(
          existingAnnotations,
          caretPosition,
          insertLength
        )
      );
      if (annotationsToInsert) {
        (newSequenceData[annotationType] as Annotation[]) = (
          newSequenceData[annotationType] as Annotation[]
        ).concat(
          adjustAnnotationsToInsert(annotationsToInsert, 0, caretPosition)
        );
      }
    }
  });

  if (
    maintainOriginSplit &&
    typeof caretPositionOrRange !== "number" &&
    caretPositionOrRange.start > caretPositionOrRange.end
  ) {
    //we're replacing around the origin and maintainOriginSplit=true
    //so rotate the resulting seqData n bps
    const caretPosToRotateTo =
      existingSequenceData.sequence.length - caretPositionOrRange.start;
    return rotateSequenceDataToPosition(
      newSequenceData,
      Math.min(caretPosToRotateTo, insertLength)
    );
  }
  return newSequenceData;
}

function adjustAnnotationsToDelete(
  annotationsToBeAdjusted: Annotation[],
  range: Range,
  maxLength: number
): Annotation[] {
  return map(annotationsToBeAdjusted, annotation => {
    const newRange = adjustRangeToDeletionOfAnotherRange(
      annotation,
      range,
      maxLength
    );
    const newLocations =
      annotation.locations &&
      annotation.locations
        .map(loc => adjustRangeToDeletionOfAnotherRange(loc, range, maxLength))
        .filter(range => !!range);

    // Check if newRange is valid (start/end exist) before returning
    if (!newRange) return null;

    if (newLocations && newLocations.length) {
      return {
        ...newRange,
        start: newLocations[0].start,
        end: newLocations[newLocations.length - 1].end,
        ...(newLocations.length > 0 && { locations: newLocations })
      };
    } else {
      return newRange;
    }
  }).filter((range): range is Annotation => !!range); //filter any fully deleted ranges
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
  justBaseCalls?: boolean;
}): ChromatogramData | void {
  if (!seqToInsert.length) return;

  if (chromatogramData.baseCalls) {
    (chromatogramData.baseCalls as unknown[]).splice(
      caretPosition,
      0,
      ...seqToInsert.split("")
    );
  }
  if (justBaseCalls) {
    //return early if just base calls
    return chromatogramData;
  }

  const baseTracesToInsert: unknown[] = [];
  const qualNumsToInsert: number[] = [];

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

  if (chromatogramData.baseTraces) {
    (chromatogramData.baseTraces as unknown[]).splice(
      caretPosition,
      0,
      ...baseTracesToInsert
    );
  }
  if (chromatogramData.qualNums) {
    (chromatogramData.qualNums as unknown[]).splice(
      caretPosition,
      0,
      ...qualNumsToInsert
    );
  }

  return chromatogramData;
}

function trimChromatogram({
  chromatogramData,
  range: { start, end },
  justBaseCalls
}: {
  chromatogramData: ChromatogramData;
  range: { start: number; end: number };
  justBaseCalls?: boolean;
}): ChromatogramData {
  [
    "baseCalls",
    ...(justBaseCalls ? [] : ["qualNums", "baseTraces", "basePos"])
  ].forEach(type => {
    if (chromatogramData[type]) {
      (chromatogramData[type] as unknown[]).splice(start, end - start + 1);
    }
  });

  return chromatogramData;
}
