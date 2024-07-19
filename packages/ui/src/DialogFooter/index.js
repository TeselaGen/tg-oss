/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */

import React, { useRef } from "react";
import { Intent, Button, Classes } from "@blueprintjs/core";
import { noop } from "lodash-es";
import classNames from "classnames";

function DialogFooter({
  hideModal,
  loading,
  submitting,
  onBackClick,
  style,
  onClick = noop,
  secondaryAction,
  secondaryDisabled,
  secondaryNotMinimal,
  intent = Intent.PRIMARY,
  secondaryIntent,
  backText = "Back",
  secondaryText = "Cancel",
  additionalButtons,
  className,
  secondaryClassName = "",
  text = "Submit",
  disabled,
  containerClassname,
  noCancel
}) {
  const divRef = useRef();
  return (
    <div
      style={style}
      ref={divRef}
      className={classNames(Classes.DIALOG_FOOTER, containerClassname)}
    >
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        {onBackClick && (
          <Button
            className={Classes.MINIMAL + " " + secondaryClassName}
            text={backText}
            onClick={onBackClick}
          />
        )}
        {!noCancel && (
          <Button
            intent={secondaryIntent}
            disabled={secondaryDisabled}
            className={
              (!secondaryNotMinimal ? Classes.MINIMAL : "") +
              " " +
              secondaryClassName
            }
            text={secondaryText}
            onClick={
              secondaryAction ||
              hideModal ||
              function () {
                try {
                  divRef.current
                    .closest(".bp3-dialog")
                    .querySelector(".bp3-dialog-close-button")
                    .click();
                } catch (error) {
                  console.error(`error closing dialog:`, error);
                }
              }
            }
          />
        )}
        {additionalButtons}
        <Button
          text={text}
          intent={intent}
          type="submit"
          className={className}
          onClick={onClick}
          disabled={disabled}
          loading={loading || submitting}
        />
      </div>
    </div>
  );
}

export default DialogFooter;
