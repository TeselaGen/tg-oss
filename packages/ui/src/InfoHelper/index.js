import React from "react";
import { Popover, Button, Tooltip, Icon } from "@blueprintjs/core";
import classnames from "classnames";
import "./style.css";
import { popoverOverflowModifiers } from "..";

export default ({
  className,
  content,
  children,
  icon = "info-sign",
  isPopover,
  isButton,
  size,
  isInline,
  clickable,
  color,
  noMarginTop,
  popoverProps = {},
  disabled,
  displayToSide,
  style,
  ...rest
}) => {
  const IconToUse = isButton ? Button : Icon;
  const iconProps = {
    icon,
    color,
    disabled
  };
  if (!isButton) iconProps.iconSize = size;

  const IconInner = <IconToUse {...iconProps} {...rest} />;
  let toReturn;
  const toolTipOrPopoverProps = {
    disabled:
      disabled ||
      (!isPopover && window.Cypress && !window.Cypress.allowInfoHelperTooltips),
    popoverClassName: "tg-info-helper-popover bp3-tooltip",
    content: content || children,
    modifiers: popoverOverflowModifiers,
    ...popoverProps
  };
  if (displayToSide) {
    toReturn = (
      <>
        {IconInner}
        <span style={{ paddingLeft: 5, fontStyle: "italic" }}>
          {content || children}
        </span>
      </>
    );
  } else if (isPopover) {
    toReturn = <Popover {...toolTipOrPopoverProps} target={IconInner} />;
  } else {
    toReturn = <Tooltip {...toolTipOrPopoverProps} target={IconInner} />;
  }
  const El = isInline ? "span" : "div";
  return (
    <El
      style={{
        ...(clickable ? { cursor: "pointer" } : {}),
        ...(isInline ? {} : { display: "flex" }),
        ...style
      }}
      className={classnames(
        "info-helper-wrapper",
        {
          "info-helper-wrapper-noMarginTop": noMarginTop,
          "info-helper-clickable": isPopover
        },
        className
      )}
    >
      {toReturn}
    </El>
  );
};
