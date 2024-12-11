/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import { useSelector } from "react-redux";
import { get } from "lodash";

export const useFormValue = (formName, field) => {
  return useSelector(state => get(state.form?.[formName]?.values, field));
};
