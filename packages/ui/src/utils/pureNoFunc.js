/**
 * This HOC compares props to create a pure component that will only update
 * when props are not deep equal. It will compare the string values of functions
 */
import { shouldUpdate } from "recompose";
import { isEqualIgnoreFunctions } from "./isEqualIgnoreFunctions";

const pure = BaseComponent => {
  const hoc = shouldUpdate(
    (props, nextProps) => !isEqualIgnoreFunctions(props, nextProps)
  );
  return hoc(BaseComponent);
};

export default pure;
