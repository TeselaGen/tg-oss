/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import React, { useMemo, useRef } from "react";
import { Dialog, useHotkeys } from "@blueprintjs/core";
import { noop, isFunction } from "lodash-es";
import { ResizableDraggableDialog } from ".";

export default (topLevelDialogProps = {}) =>
  Component =>
  props => {
    const r = useRef();
    const memoedHotkeys = useMemo(
      () => [
        {
          combo: topLevelDialogProps.useCmdEnter ? "cmd+enter" : "enter",
          global: true,
          allowInInput: true,
          onKeyDown: () => {
            function doNotTriggerClick() {
              //leave this here for debugging purposes
              // console.log(`Not triggering dialog submit`);
            }

            try {
              if (!document.activeElement) return doNotTriggerClick();
              if (
                !document.activeElement.closest(".tg-allow-dialog-form-enter")
              ) {
                //don't do this if you're in any type of bp multi select by default
                if (document.activeElement.closest(".bp5-multi-select"))
                  return doNotTriggerClick();
                //don't do this if there is an explicit class saying not to
                if (
                  document.activeElement.closest(".tg-stop-dialog-form-enter")
                )
                  return doNotTriggerClick();
                //don't do this in text areas
                if (document.activeElement.type === "textarea")
                  return doNotTriggerClick();
              }
              const parentEl = r.current?.closest(".bp5-dialog-container");
              // eslint-disable-next-line no-inner-declarations
              function triggerClick() {
                parentEl?.querySelector(`button[type='submit']`).click();
              }

              const dialogs = document.querySelectorAll(
                ".bp5-dialog-container"
              );
              const numDialogs = dialogs?.length;

              if (numDialogs > 1) {
                const topMostDialog = dialogs[numDialogs - 1];
                if (topMostDialog === parentEl) {
                  triggerClick();
                }
              } else {
                //just 1 dialog
                triggerClick();
              }
            } catch (error) {
              console.error(`error:`, error);
            }
          }
        }
      ],
      []
    );

    useHotkeys(memoedHotkeys);

    let otherTopLevelProps,
      getDialogProps = noop;
    if (isFunction(topLevelDialogProps)) {
      getDialogProps = topLevelDialogProps;
    } else {
      const {
        footerProps,
        getDialogProps: _pullOff,
        ...additionalProps
      } = topLevelDialogProps;
      otherTopLevelProps = additionalProps;
      getDialogProps = topLevelDialogProps.getDialogProps || noop;
    }
    const { dialogProps, hideModal, ...otherProps } = props;

    const extraDialogProps = {
      ...otherTopLevelProps,
      ...dialogProps,
      ...getDialogProps(props)
    };
    const DialogToUse = extraDialogProps.isDraggable
      ? ResizableDraggableDialog
      : Dialog;
    return (
      <DialogToUse
        canOutsideClickClose={false}
        isOpen
        onClose={e => {
          e.stopPropagation();
          if (
            e.key === "Escape" &&
            extraDialogProps.canEscapeKeyClose === false
          ) {
            return;
          }
          hideModal(e);
        }}
        {...extraDialogProps}
        canEscapeKeyClose={true}
        style={{ ...extraDialogProps.style }}
      >
        <div ref={r}></div>
        <Component hideModal={hideModal} {...otherProps} />
      </DialogToUse>
    );
  };
