import React from "react";
import { Field } from "redux-form";
import { fieldRequired } from "../FormComponents/utils";

//simple enhancer that wraps a component in a redux <Field/> component
//all options are passed as props to <Field/>
export default function WithField(fieldProps) {
  return function AddFieldHOC(Component) {
    return function AddField({ isRequired, ...rest }) {
      return (
        <Field
          {...(isRequired && { validate: fieldRequired })}
          {...fieldProps}
          {...rest}
          component={Component}
        />
      );
    };
  };
}
