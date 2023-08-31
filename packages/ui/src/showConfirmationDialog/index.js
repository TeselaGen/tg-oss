import React, { Component } from "react";
import { Button, Dialog, Intent } from "@blueprintjs/core";
import { renderOnDoc } from "../utils/renderOnDoc";
import DialogFooter from "../DialogFooter";

// usage
// const doAction = await showConfirmationDialog({
//   text:
//     "Are you sure you want to re-run this tool? Downstream tools with linked outputs will need to be re-run as well!",
//     intent: Intent.DANGER, //applied to the right most confirm button
//     confirmButtonText: "Yep!",
//     cancelButtonText: "Nope",
//     canEscapeKeyCancel: true //this is false by default
// });
// console.info("doAction:", doAction);

// const doAction = await showConfirmationDialog({
//   thirdButtonText: 'Click me'
//   thirdButtonIntent: 'primary'
// });
// console.info("doAction:", doAction); //logs thirdButtonClicked
//returns a promise that resolves with true or false depending on if the user cancels or not!
export default function showConfirmationDialog(opts) {
  return new Promise(resolve => {
    renderOnDoc(handleClose => {
      return <AlertWrapper {...{ ...opts, handleClose, resolve }} />;
    });
  });
}

class AlertWrapper extends Component {
  state = { isOpen: true };
  render() {
    const {
      handleClose,
      text,
      resolve,
      noCancelButton,
      content,
      className,
      thirdButtonText,
      thirdButtonIntent,
      fourthButtonText,
      fourthButtonIntent,
      canEscapeKeyCancel,
      confirmButtonText = "OK",
      cancelButtonText = "Cancel",
      intent = Intent.PRIMARY,
      ...rest
    } = this.props;
    const doClose = confirm => {
      handleClose();
      this.setState({ isOpen: false });
      resolve(confirm);
    };
    return (
      <Dialog
        className={`bp3-alert ${className || ""}`}
        isOpen={this.state.isOpen}
        intent={intent}
        cancelButtonText={cancelButtonText}
        onCancel={cancelButtonText ? () => doClose(false) : undefined}
        onConfirm={() => doClose(true)}
        {...rest}
        {...(noCancelButton && {
          onCancel: undefined,
          cancelButtonText: undefined
        })}
      >
        <div className="bp3-alert-contents" style={{ padding: 5 }}>
          {content}
          {text && <div style={{ marginBottom: 10 }}>{text}</div>}
        </div>
        <DialogFooter
          {...{
            onBackClick:
              cancelButtonText && !noCancelButton
                ? () => doClose(false)
                : undefined,
            onClick: () => doClose(true),
            noCancel: true,
            additionalButtons:
              thirdButtonText || fourthButtonText ? (
                <React.Fragment>
                  {!!fourthButtonText && (
                    <Button
                      intent={fourthButtonIntent}
                      text={fourthButtonText}
                      onClick={() => {
                        doClose("fourthButtonClicked");
                      }}
                    ></Button>
                  )}
                  {!!thirdButtonText && (
                    <Button
                      intent={thirdButtonIntent}
                      text={thirdButtonText}
                      onClick={() => {
                        doClose("thirdButtonClicked");
                      }}
                    ></Button>
                  )}
                </React.Fragment>
              ) : undefined,
            containerClassname: "bp3-alert-footer",
            backText: noCancelButton ? "" : cancelButtonText,
            text: confirmButtonText,
            intent
          }}
        ></DialogFooter>
      </Dialog>
    );
  }
}
