import { toNumber } from "lodash-es";
import { getVals } from "./getVals";
import { isValueEmpty } from "./isValueEmpty";
import { isTruthy } from "./isTruthy";

export const defaultFormatters = {
  boolean: newVal => {
    return isTruthy(newVal);
  },
  dropdown: (newVal, field) => {
    const valsMap = {};
    getVals(field.values).forEach(v => {
      valsMap[v.toLowerCase().trim()] = v;
    });
    return valsMap[newVal?.toLowerCase().trim()] || newVal;
  },
  dropdownMulti: (newVal, field) => {
    const valsMap = {};
    getVals(field.values).forEach(v => {
      valsMap[v.toLowerCase().trim()] = v;
    });
    if (!newVal) return;
    return newVal
      .split(",")
      .map(v => valsMap[v.toLowerCase().trim()] || v)
      .join(",");
  },
  number: newVal => {
    if (isValueEmpty(newVal)) return newVal;
    return toNumber(newVal);
  }
};
