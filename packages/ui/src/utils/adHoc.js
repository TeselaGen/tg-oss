import React from "react";
import { compose } from "recompose";

//adHoc allows you to add dynamic HOCs to a component
export default func => WrappedComponent => props => {
  const calledFunc = func(props);
  const composeArgs = Array.isArray(calledFunc) ? calledFunc : [calledFunc];
  const ComposedAndWrapped = compose(...composeArgs)(WrappedComponent);
  return <ComposedAndWrapped {...props} />;
};
