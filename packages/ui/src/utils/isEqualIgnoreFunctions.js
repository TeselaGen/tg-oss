/**
 * This HOC compares props to create a pure component that will only update
 * when props are not deep equal. It will compare the string values of functions
 */
import { isEqualWith, isFunction } from "lodash-es";

/**
 * tgreen: This is an awful function which we should come up with a better solution for
 * @param {*} o1
 * @param {*} o2
 */
export const isEqualIgnoreFunctions = (o1, o2) => {
  const isEq = isEqualWith(o1, o2, function (val1, val2) {
    if (isFunction(val1) && isFunction(val2)) {
      return val1 === val2 || val1.toString() === val2.toString();
    }
    // tgreen: we were seeing an issue where the isEq would infinite loop on react children
    // components. We decided to just ignore them (assume they are equal)
    if (val1 && val1.constructor && val1.constructor.name === "FiberNode")
      return true;
  });
  return isEq;
};
