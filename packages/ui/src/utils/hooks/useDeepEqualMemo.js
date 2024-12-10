import { useRef } from "react";
import { isEqStrCompareFns } from "../isEqStrCompareFns";

export const useDeepEqualMemo = value => {
  const ref = useRef();
  if (!isEqStrCompareFns(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};
