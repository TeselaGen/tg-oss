import { isEqual } from "lodash-es";
import { useRef } from "react";

export const useDeepEqualMemo = (value: unknown) => {
  const ref = useRef<unknown>();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};
