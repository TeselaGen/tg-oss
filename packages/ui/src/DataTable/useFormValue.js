import { get } from "lodash-es";
import { useSelector } from "react-redux";

export const useFormValue = (formName, field, defaultVal) => {
  return useSelector(state =>
    get(state.form?.[formName]?.values, field, defaultVal)
  );
};
