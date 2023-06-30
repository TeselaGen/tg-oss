import React from "react";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";

export default function BlueprintError({ error }) {
  if (!error) return null;
  return (
    <div className={classNames(Classes.FORM_GROUP, Classes.INTENT_DANGER)}>
      <div className={classNames(Classes.FORM_HELPER_TEXT, "preserve-newline")}>
        {error}
      </div>
    </div>
  );
}
