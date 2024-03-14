
import { getCellAlphaNumHelper, lettersToNumber } from "./editCellHelper";


export function offsetFormulaByIndex({
  newRowIndex, // 2 or 13
  oldRowIndex,
  newCol, // "a" or "C"
  oldCol,
  formula
}) {
  return formula.replace(/([A-Z]+[0-9]+)/gi, _match => {
    const match = _match.toUpperCase();
    const [letter, rowIndex] = match.split(/(\d+)/);
    const letterIndex = lettersToNumber(letter);
    const colIndex = letterIndex;
    const rowIndexInt = parseInt(rowIndex);
    if (rowIndexInt === oldRowIndex && colIndex === oldColIndex) {
      return getCellAlphaNumHelper(newColIndex, newRowIndex);
    }
    return match;
  });
}
