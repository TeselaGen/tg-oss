import { each, forEach, startsWith, filter } from "lodash-es";
import {
  getYOffsetForPotentiallyCircularRange,
  splitRangeIntoTwoPartsIfItIsCircular,
  checkIfPotentiallyCircularRangesOverlap
} from "@teselagen/range-utils";
import { Annotation } from "./types";

export interface MappedAnnotation extends Annotation {
  yOffset?: number;
  enclosingRangeType?: "beginning" | "end" | "beginningAndEnd";
  annotation?: Annotation;
}

export default function mapAnnotationsToRows(
  annotations: Annotation[],
  sequenceLength: number,
  bpsPerRow: number,
  { splitForwardReverse }: { splitForwardReverse?: boolean } = {}
) {
  const annotationsToRowsMap: Record<number | string, MappedAnnotation[]> = {};
  const yOffsetLevelMap: Record<
    string | number,
    { start: number; end: number }[][]
  > = {};
  const wrappedAnnotations: Record<string, boolean> = {};

  each(annotations, annotation => {
    const containsLocations = !!(
      annotation.locations && annotation.locations.length
    );
    if (annotation.overlapsSelf) {
      if (!wrappedAnnotations[annotation.id as string]) {
        mapAnnotationToRows({
          wrappedAnnotations,
          annotation: {
            ...annotation,
            start: 0,
            end: sequenceLength - 1,
            id: `__tempAnnRemoveMe__${annotation.id}`,
            overlapsSelf: false
          },
          sequenceLength,
          bpsPerRow,
          annotationsToRowsMap,
          yOffsetLevelMap,
          containsLocations,
          splitForwardReverse
        });
        wrappedAnnotations[annotation.id as string] = true;
      }
    }

    mapAnnotationToRows({
      wrappedAnnotations,
      annotation,
      sequenceLength,
      bpsPerRow,
      annotationsToRowsMap,
      yOffsetLevelMap,
      containsLocations,
      splitForwardReverse
    });

    if (containsLocations) {
      annotation.locations?.forEach(location => {
        mapAnnotationToRows({
          wrappedAnnotations,
          annotation,
          sequenceLength,
          bpsPerRow,
          annotationsToRowsMap,
          yOffsetLevelMap,
          location: location as Annotation,
          splitForwardReverse
        });
      });
    }
  });

  forEach(annotationsToRowsMap, (annotationsForRow, i) => {
    annotationsToRowsMap[i] = filter(
      annotationsForRow,
      ann => !startsWith(String(ann.id), "__tempAnnRemoveMe__")
    );
  });
  return annotationsToRowsMap;
}

interface MapAnnotationToRowsParams {
  wrappedAnnotations: Record<string, boolean>;
  annotation: Annotation;
  sequenceLength: number;
  bpsPerRow: number;
  annotationsToRowsMap: Record<number | string, MappedAnnotation[]>;
  yOffsetLevelMap: Record<string | number, { start: number; end: number }[][]>;
  location?: Annotation;
  containsLocations?: boolean;
  splitForwardReverse?: boolean;
}

function mapAnnotationToRows({
  annotation,
  sequenceLength,
  bpsPerRow,
  annotationsToRowsMap,
  yOffsetLevelMap,
  location,
  containsLocations,
  splitForwardReverse
}: MapAnnotationToRowsParams) {
  const ranges = splitRangeIntoTwoPartsIfItIsCircular(
    location || annotation,
    sequenceLength
  );

  ranges.forEach((range, index) => {
    const startingRow = Math.floor(range.start / bpsPerRow);
    const endingRow = Math.floor(range.end / bpsPerRow);

    for (let rowNumber = startingRow; rowNumber <= endingRow; rowNumber++) {
      if (!annotationsToRowsMap[rowNumber]) {
        annotationsToRowsMap[rowNumber] = [];
      }
      const key = splitForwardReverse
        ? annotation.forward
          ? rowNumber + "_forward"
          : rowNumber + "_reverse"
        : rowNumber;

      const annotationsForRow = annotationsToRowsMap[rowNumber];
      if (!yOffsetLevelMap[key]) {
        yOffsetLevelMap[key] = [];
      }

      let yOffset: number | undefined;
      const yOffsetsForRow = yOffsetLevelMap[key];
      const start =
        rowNumber === startingRow ? range.start : rowNumber * bpsPerRow;
      const end =
        rowNumber === endingRow
          ? range.end
          : rowNumber * bpsPerRow + bpsPerRow - 1;

      if (annotation.overlapsSelf) {
        annotationsForRow.forEach(ann => {
          if (ann.id === `__tempAnnRemoveMe__${annotation.id}`) {
            yOffset = ann.yOffset;
          }
        });
        if (yOffset === undefined) {
          annotationsForRow.forEach(ann => {
            if (ann.id === annotation.id) {
              yOffset = ann.yOffset;
            }
          });
        }
      } else {
        if (location) {
          annotationsForRow.forEach(ann => {
            if (ann.id === annotation.id) {
              yOffset = ann.yOffset;
            }
          });
        } else {
          if (
            index > 0 &&
            annotationsForRow.length &&
            annotationsForRow[annotationsForRow.length - 1].annotation ===
              annotation
          ) {
            yOffset = annotationsForRow[annotationsForRow.length - 1].yOffset;
          } else {
            const siblingRangesOnThisRow = ranges.slice(index + 1).filter(r => {
              const rStartRow = Math.floor(r.start / bpsPerRow);
              const rEndRow = Math.floor(r.end / bpsPerRow);
              return rowNumber >= rStartRow && rowNumber <= rEndRow;
            });

            if (siblingRangesOnThisRow.length > 0) {
              // We have future ranges for this annotation on this row.
              // We must choose a yOffset that works for the current range AND all future ranges.
              let foundYOffset = -1;
              yOffsetsForRow.some((rangesAlreadyAddedToYOffset, levelIndex) => {
                const rangeBlocked = rangesAlreadyAddedToYOffset.some(
                  comparisonRange => {
                    return checkIfPotentiallyCircularRangesOverlap(
                      range,
                      comparisonRange
                    );
                  }
                );
                if (rangeBlocked) return false;

                // Check siblings
                const siblingBlocked = siblingRangesOnThisRow.some(
                  siblingRange => {
                    return rangesAlreadyAddedToYOffset.some(comparisonRange => {
                      return checkIfPotentiallyCircularRangesOverlap(
                        siblingRange,
                        comparisonRange
                      );
                    });
                  }
                );

                if (!siblingBlocked) {
                  foundYOffset = levelIndex;
                  return true;
                }
                return false;
              });

              if (foundYOffset > -1) {
                yOffset = foundYOffset;
                yOffsetsForRow[foundYOffset].push(range);
              } else {
                // Create new level
                yOffset = yOffsetsForRow.length;
                yOffsetsForRow.push([range]);
              }
            } else {
              yOffset = getYOffsetForPotentiallyCircularRange(
                range,
                yOffsetsForRow,
                false
              );
            }
          }
          if (yOffset !== undefined) {
            if (!yOffsetsForRow[yOffset]) yOffsetsForRow[yOffset] = [];
            yOffsetsForRow[yOffset].push({
              start: start,
              end: end
            });
          }
        }
      }

      annotationsForRow.push({
        ...annotation,
        id: annotation.id,
        annotation: annotation,
        start: start,
        end: end,
        ...(containsLocations && { containsLocations }),
        ...(location && { isJoinedLocation: !!location }),
        yOffset: yOffset,
        enclosingRangeType: range.type as
          | "beginning"
          | "end"
          | "beginningAndEnd"
      });
    }
  });
}
