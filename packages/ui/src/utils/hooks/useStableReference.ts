import { useEffect, useRef } from "react";

export const useStableReference = (value: unknown) => {
  const ref = useRef<unknown>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};
