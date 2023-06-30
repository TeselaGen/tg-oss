import { Icon } from "@blueprintjs/core";
import classNames from "classnames";
import React from "react";

export default function SimpleStepViz({ steps, ...rest }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <ul className="bp3-breadcrumbs" {...rest}>
        {steps.map(({ completed, active, text }, i) => {
          return (
            <li key={i}>
              <div
                className={classNames("bp3-breadcrumb", {
                  "bp3-breadcrumb-current": active
                })}
              >
                <Icon icon={completed ? "tick-circle" : undefined}></Icon>
                {text}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
