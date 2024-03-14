import { get } from "lodash";
import { isString } from "lodash";
import { isTruthy } from "./isTruthy";

export const getCellVal = (ent, path, col) => {
  const isBool = col?.type === "boolean";
  let selectedCellVal = get(ent, path, "");
  if (isBool) {
    if (isString(selectedCellVal)) {
      selectedCellVal = selectedCellVal.toLowerCase();
    }
    selectedCellVal =
      selectedCellVal === "true" ||
      selectedCellVal === true ||
      selectedCellVal === 1 ||
      selectedCellVal === "yes";
    selectedCellVal = isTruthy(selectedCellVal);
  }
  return selectedCellVal;
};
