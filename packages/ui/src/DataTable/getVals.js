import { isFunction } from "lodash";

export function getVals(values) {
  if (isFunction(values)) {
    return values();
  }
  return values;
}
