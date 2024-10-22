import { useEffect, useRef } from "react";

export const useStableReference = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};
