import React from "react";
import { withProps } from "recompose";

import { InputField } from "../../../src";
import { compose } from "redux";
import { reduxForm } from "redux-form";

export default compose(
  withProps(() => {
    return {
      initialValues: {
        defaultVal: "Default Value From Initial"
      }
    };
  }),
  reduxForm({
    form: "defaultValForm"
  })
)(function DefaultVal() {
  return (
    <div style={{}}>
      {/* default val demo for InputField  */}
      <InputField
        label="Default Value"
        name="defaultVal"
        defaultValue="Default Value"
        placeholder="Enter text here"
      />
      <InputField
        label="Default Value 2"
        name="defaultVal2"
        defaultValue="Default Value from defaultValue prop"
        placeholder="Enter text here"
      />
    </div>
  );
});
