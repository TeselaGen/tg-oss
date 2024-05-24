import { isFunction } from "lodash-es";

export function getVals(values) {
  if (isFunction(values)) {
    return values();
  }
  return values;
}
