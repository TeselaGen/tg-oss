import { useEffect, useRef } from "react";

// useful for debugging rerender errors
/* 
  Usage:
  useTraceUpdate(props);
*/
export const useTraceUpdate = props => {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      // eslint-disable-next-line no-console
      console.log("Changed props:", changedProps);
    }
    prev.current = props;
  });
};
