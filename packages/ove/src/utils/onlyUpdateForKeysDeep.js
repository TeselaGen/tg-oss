import { pick } from "lodash-es";
import { shouldUpdate } from "recompose";
import { isEqStrCompareFns } from "@teselagen/ui";

// import deepEqual from "deep-equal";

const onlyUpdateForKeys = propKeys => {
  const hoc = shouldUpdate((props, nextProps) => {
    const a = !isEqStrCompareFns(
      pick(nextProps, propKeys),
      pick(props, propKeys)
    );
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
