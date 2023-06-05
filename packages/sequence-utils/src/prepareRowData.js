
// ac.throw([ac.posInt, ac.posInt, ac.bool], arguments);
import mapAnnotationsToRows from "./mapAnnotationsToRows";

import { annotationTypes } from "./annotationTypes";

export default function prepareRowData(sequenceData, bpsPerRow) {
  // ac.throw([ac.sequenceData, ac.posInt], arguments);
  const sequenceLength = sequenceData.sequence.length;
  const totalRows = Math.ceil(sequenceLength / bpsPerRow) || 1; //this check makes sure there is always at least 1 row!
  const rows = [];
  const rowMap = {};
  annotationTypes.forEach(type => {
    rowMap[type] = mapAnnotationsToRows(
      sequenceData[type],
      sequenceLength,
      bpsPerRow,
      { splitForwardReverse: type === "primers" }
    );
  });

  for (let rowNumber = 0; rowNumber < totalRows; rowNumber++) {
    const row = {};
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
};
