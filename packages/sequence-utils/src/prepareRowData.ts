// ac.throw([ac.posInt, ac.posInt, ac.bool], arguments);
import mapAnnotationsToRows, { MappedAnnotation } from "./mapAnnotationsToRows";

import { annotationTypes } from "./annotationTypes";

import { SequenceData, Annotation } from "./types";

export interface RowData {
  rowNumber: number;
  start: number;
  end: number;
  sequence: string;
  [key: string]: MappedAnnotation[] | number | string;
}

export default function prepareRowData(
  sequenceData: SequenceData,
  bpsPerRow: number
) {
  // ac.throw([ac.sequenceData, ac.posInt], arguments);
  const sequenceLength = sequenceData.sequence.length;
  const totalRows = Math.ceil(sequenceLength / bpsPerRow) || 1; //this check makes sure there is always at least 1 row!
  const rows: RowData[] = [];
  const rowMap: Record<
    string,
    Record<string | number, MappedAnnotation[]>
  > = {};
  annotationTypes.forEach(type => {
    rowMap[type] = mapAnnotationsToRows(
      (sequenceData[type] as Annotation[]) || [],
      sequenceLength,
      bpsPerRow,
      { splitForwardReverse: type === "primers" }
    );
  });

  for (let rowNumber = 0; rowNumber < totalRows; rowNumber++) {
    const row: RowData = {
      rowNumber,
      start: 0,
      end: 0,
      sequence: ""
    };
    row.rowNumber = rowNumber;
    row.start = rowNumber * bpsPerRow;
    row.end =
      (rowNumber + 1) * bpsPerRow - 1 < sequenceLength
        ? (rowNumber + 1) * bpsPerRow - 1
        : sequenceLength - 1;
    if (row.end < 0) {
      row.end = 0;
    }
    annotationTypes.forEach(type => {
      row[type] = rowMap[type][rowNumber] || [];
    });
    row.sequence = sequenceData.sequence.slice(row.start, row.end + 1);

    rows[rowNumber] = row;
  }
  return rows;
}
