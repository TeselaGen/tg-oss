import { useEffect, useRef } from "react";
import { isEqualIgnoreFunctions } from "../isEqualIgnoreFunctions";

export const useDeepEqualMemo = value => {
  const ref = useRef();
  if (!isEqualIgnoreFunctions(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};

export const useDeepEqualEffect = (effect, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(effect, useDeepEqualMemo(deps));
};
