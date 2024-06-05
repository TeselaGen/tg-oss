import { shouldUpdate } from "recompose";
import { isEqualWith, isFunction } from "lodash-es";

const isEq = (o1, o2) => {
  const isEq = isEqualWith(o1, o2, function (val1, val2) {
    if (isFunction(val1) && isFunction(val2)) {
      return val1 === val2 || val1.toString() === val2.toString();
    }
  });
  return isEq;
};

const pure = BaseComponent => {
  const hoc = shouldUpdate((props, nextProps) => !isEq(props, nextProps));
  return hoc(BaseComponent);
};

export default pure;
