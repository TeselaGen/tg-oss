export const isBottomRightCornerOfRectangle = ({
  cellId,
  selectionGrid,
  lastRowIndex,
  lastCellIndex,
  entityMap,
  pathToIndex
}: {
  cellId: string;
  selectionGrid: (string | undefined)[][];
  lastRowIndex: number;
  lastCellIndex: number;
  entityMap: Record<string, { i: number }>;
  pathToIndex: Record<string, number>;
}) => {
  selectionGrid.forEach(row => {
    // remove undefineds from start of row
    while (row[0] === undefined && row.length) row.shift();
  });
  const [rowId, cellPath] = cellId.split(":");
  const ent = entityMap[rowId];
  if (!ent) return;
  const { i } = ent;
  const cellIndex = pathToIndex[cellPath];
  const isBottomRight = i === lastRowIndex && cellIndex === lastCellIndex;
  return isBottomRight;
};
