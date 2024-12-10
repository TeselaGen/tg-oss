import { isEqualWith, isFunction } from "lodash-es";

export const isEqStrCompareFns = (o1, o2) => {
  const isEq = isEqualWith(o1, o2, function (val1, val2) {
    if (isFunction(val1) && isFunction(val2)) {
      return val1 === val2 || val1.toString() === val2.toString();
    }
  });
  return isEq;
};
