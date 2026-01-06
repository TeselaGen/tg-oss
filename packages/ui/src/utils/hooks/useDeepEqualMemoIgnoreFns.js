import { useEffect, useRef, useMemo } from "react";
import { isEqualIgnoreFunctions } from "../isEqualIgnoreFunctions";
import { isEqual } from "lodash-es";

export const useDeepEqualMemoIgnoreFns = value => {
  const ref = useRef();
  if (!isEqualIgnoreFunctions(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};

export const useDeepEqualMemo = value => {
  const ref = useRef();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};
export const useMemoDeepEqual = (value, depsArray) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(value, useDeepEqualMemo(depsArray));
};

export const useDeepEqualEffect = (effect, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(effect, useDeepEqualMemoIgnoreFns(deps));
};
