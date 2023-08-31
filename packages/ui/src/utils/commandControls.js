import React from "react";
import { Tooltip, Checkbox, Button, Switch } from "@blueprintjs/core";

export const withCommand =
  mappings =>
  WrappedComponent =>
  ({ cmd, cmdOptions = {}, ...props }) => {
    const mappedProps = {};
    Object.keys(mappings).forEach(k => {
      mappedProps[k] =
        mappings[k] === "execute"
          ? event => cmd.execute({ event })
          : typeof mappings[k] === "function"
          ? mappings[k](cmd, props)
          : cmd[mappings[k]];
    });

    let out = <WrappedComponent {...mappedProps} {...props} />;
    const tooltip =
      cmd.tooltip || (typeof cmd.isDisabled === "string" && cmd.isDisabled);
    if (tooltip && !cmdOptions.ignoreTooltip) {
      out = <Tooltip content={tooltip}>{out}</Tooltip>;
    }

    return cmd.isHidden && !cmdOptions.ignoreHidden ? null : out;
  };

export const CmdCheckbox = withCommand({
  onChange: "execute",
  label: (cmd, props) =>
    props.name ||
    (props.prefix && (
      <React.Fragment>
        {props.prefix}
        {cmd.name}
      </React.Fragment>
    )) ||
    cmd.name,
  disabled: "isDisabled",
  checked: "isActive"
})(Checkbox);

export const CmdSwitch = withCommand({
  onChange: "execute",
  label: (cmd, props) =>
    props.name ||
    (props.prefix && (
      <React.Fragment>
        {props.prefix}
        {cmd.name}
      </React.Fragment>
    )) ||
    cmd.name,
  disabled: "isDisabled",
  checked: "isActive"
})(Switch);

const Div = ({ onChange, children }) => {
  return <div onClick={onChange}>{children}</div>;
};

export const CmdDiv = withCommand({
  onChange: "execute",
  children: (cmd, props) =>
    props.name ||
    (props.prefix && (
      <React.Fragment>
        {props.prefix}
        {cmd.name}
      </React.Fragment>
    )) ||
    cmd.name,
  disabled: "isDisabled",
  checked: "isActive"
})(Div);

export const CmdButton = withCommand({
  onClick: "execute",
  text: cmd => (cmd.isActive === false && cmd.inactiveName) || cmd.name,
  icon: "icon",
  disabled: "isDisabled"
})(Button);
