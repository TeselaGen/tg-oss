import React from "react";
import { Icon } from "@blueprintjs/core";
import classNames from "classnames";

export default ({ steps, ...rest }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <ul className="bp3-breadcrumbs" {...rest}>
      {steps.map(({ completed, active, text }, i) => (
        <li key={i}>
          <div
            className={classNames("bp3-breadcrumb", {
              "bp3-breadcrumb-current": active
            })}
          >
            <Icon icon={completed ? "tick-circle" : undefined} />
            {text}
          </div>
        </li>
      ))}
    </ul>
  </div>
);
