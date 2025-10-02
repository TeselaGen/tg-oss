import React, { useState } from "react";
import { Button, Classes, Icon } from "@blueprintjs/core";
import classNames from "classnames";
import "./style.css";
import InfoHelper from "../InfoHelper";

export default function CollapsibleCard({
  title,
  icon,
  openTitleElements,
  noCard = false,
  className,
  style,
  children,
  helperText,
  initialClosed = false,
  toggle,
  isOpen
}) {
  let [open, setOpen] = useState(!initialClosed);
  if (isOpen !== undefined) open = isOpen;

  const toggleCardInfo = () => {
    if (toggle) toggle();
    else {
      setOpen(!open);
    }
  };

  return (
    <div
      className={classNames({ "tg-card": !noCard, open }, className)}
      style={{
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        ...style
      }}
    >
      <div className="tg-card-header" style={{ marginBottom: 8 }}>
        <div className="tg-card-header-title">
          {icon && <Icon icon={icon} />}
          <h6
            style={{
              marginBottom: 0,
              marginRight: 10,
              marginLeft: 10
            }}
          >
            {title}
          </h6>
          {helperText && (
            <>
              <InfoHelper children={helperText}></InfoHelper> &nbsp;
            </>
          )}
          {open && <div> {openTitleElements}</div>}
        </div>
        <div>
          <Button
            icon={open ? "minimize" : "maximize"}
            className={classNames(
              Classes.MINIMAL,
              "info-btn",
              "tg-collapse-toggle"
            )}
            onClick={toggleCardInfo}
          />
        </div>
      </div>
      {open && children}
    </div>
  );
}
