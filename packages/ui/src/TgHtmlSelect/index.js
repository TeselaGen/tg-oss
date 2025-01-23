import { HTMLSelect } from "@blueprintjs/core";
import React from "react";
import classNames from "classnames";

// so far this component just makes the styling of the disabled html select
// look like a regular html select with the selected option displayed
// (instead of greyed out and without the ability to have tooltips working)
const TgHTMLSelect = ({ disabled, ...rest }) => {
  if (disabled) {
    const opt = rest.options.find(o => o.value === rest.value);
    return (
      <div {...rest} className={classNames("bp3-html-select", rest.className)}>
        {opt.label}
      </div>
    );
  }
  return <HTMLSelect {...rest}></HTMLSelect>;
};

export default TgHTMLSelect;
