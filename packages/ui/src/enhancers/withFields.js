import React from "react";
import { Fields } from "redux-form";
//simple enhancer that wraps a component in a redux <Fields/> component
//all options are passed as props to <Fields/>
export default function WithFields(fieldsProps) {
  return function AddFieldsHOC(Component) {
    return function AddFields(props) {
      return <Fields {...fieldsProps} {...props} component={Component} />;
    };
  };
}
