import { pick } from "lodash-es";
import { shouldUpdate } from "recompose";
import { isEqualWith, isFunction } from "lodash-es";

// import deepEqual from "deep-equal";

const onlyUpdateForKeys = propKeys => {
  const hoc = shouldUpdate((props, nextProps) => {
    const a = !isEq(pick(nextProps, propKeys), pick(props, propKeys));
    return a;
  });

  // if (process.env.NODE_ENV !== "production") {
  //   return BaseComponent =>
  //     setDisplayName(wrapDisplayName(BaseComponent, "onlyUpdateForKeys"))(
  //       hoc(BaseComponent)
  //     );
  // }
  return hoc;
};

export default onlyUpdateForKeys;

const isEq = (o1, o2) => {
  const isEq = isEqualWith(o1, o2, function (val1, val2) {
    if (isFunction(val1) && isFunction(val2)) {
      return val1 === val2 || val1.toString() === val2.toString();
    }
  });
  return isEq;
};
