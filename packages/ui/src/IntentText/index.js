import React from "react";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";

const intentToClass = {
  danger: Classes.INTENT_DANGER,
  warning: Classes.INTENT_WARNING,
  success: Classes.INTENT_SUCCESS,
  primary: Classes.INTENT_PRIMARY
};

export default function IntentText({ intent, text, children }) {
  return (
    <div className={classNames(Classes.FORM_GROUP, intentToClass[intent])}>
      <div className={Classes.FORM_HELPER_TEXT}>{text || children}</div>
    </div>
  );
}
