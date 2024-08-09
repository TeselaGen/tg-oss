import { isEqual } from "lodash-es";
import { useRef } from "react";

export const useDeepEqualMemo = value => {
  const ref = useRef();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};
