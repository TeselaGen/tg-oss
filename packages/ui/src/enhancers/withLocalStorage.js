import React from "react";
import { Field } from "redux-form";
//simple enhancer that wraps a component in a redux <Field/> component
//all options are passed as props to <Field/>
export default function WithField(fieldProps) {
  return function AddFieldHOC(Component) {
    return function AddField(props) {
      return <Field {...fieldProps} {...props} component={Component} />;
    };
  };
}
