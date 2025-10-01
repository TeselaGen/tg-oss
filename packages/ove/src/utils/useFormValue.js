/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import { useSelector } from "react-redux";
import { get } from "lodash";

export const useFormValue = (formName, field) => {
  const formValSelector = state => get(state.form?.[formName]?.values, field);
  return useSelector(formValSelector);
};
