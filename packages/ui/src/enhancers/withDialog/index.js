import React from "react";
import { Dialog } from "@blueprintjs/core";
import { connect } from "react-redux";
import { lifecycle, compose } from "recompose";
import { camelCase } from "lodash";
import { nanoid } from "nanoid";
import ResizableDraggableDialog from "../../ResizableDraggableDialog";

/**
 * usage:
 * in container:
 * compose(
 *   withDialog({ title: "Select Aliquot(s) From", other bp dialog props here  })
 * )
 *
 *
 * in react component
 * import MyDialogEnhancedComponent from "./MyDialogEnhancedComponent"
 *
 * render() {
 *  return <div>
 *    <MyDialogEnhancedComponent
 *      dialogProps={} //bp dialog overrides can go here
 *      target={<button>Open Dialog</button> } //target can also be passed as a child component
 *      myRandomProp={'yuppp'} //pass any other props like normal to the component
 *
 *    />
 *  </div>
 * }
 */

//  or programatically:
// const ProgramaticDialog = withDialog({
//   dialogName: "programaticDialog", //giving it a unique dialogName means you can
//   title: "Programatic Dialog Demo"
// })(DialogInner);
//
// add the no target dialog somewhere on the page
// <ProgramaticDialog></ProgramaticDialog> //this just renders without any target
//
// somewhere else on the page:
// <Button>Click To Open Dialog</Button>

export default function withDialog(topLevelDialogProps) {
  function dialogHoc(WrappedComponent) {
    return class DialogWrapper extends React.Component {
      componentWillUnmount() {
        const { dispatch, dialogName, uniqueName } = this.props;
        if (dialogName) {
          dispatch({
            type: "TG_UNREGISTER_MODAL",
            name: dialogName,
            uniqueName
          });
        }
      }
      render() {
        const {
          target,
          noTarget,
          isDialogOpen,
          showModal,
          dialogName,
          onClickRename,
          hideModal,
          fetchPolicy = "network-only",
          children,
          onCloseHook,
          dialogProps,
          title,
          isDraggable,
          alreadyRendering,
          ...rest
        } = this.props;
        const extraDialogProps = {
          ...topLevelDialogProps,
          ...dialogProps
        };
        const _onCloseHook = onCloseHook || extraDialogProps.onCloseHook;
        const { noButtonClickPropagate } = {
          ...this.props,
          ...extraDialogProps
        };
        const isOpen = isDialogOpen || extraDialogProps.isOpen;
        const targetEl = target || children;
        // if (!targetEl && !dialogName)
        //   throw new Error(
        //     "withDialog error: Please provide a target or child element to the withDialog() enhanced component. If you really don't want a target, please pass a 'noTarget=true' prop"
        //   );
        const DialogToUse =
          isDraggable || extraDialogProps.isDraggable
            ? ResizableDraggableDialog
            : Dialog;
        return (
          <React.Fragment>
            {isOpen && (
              <DialogToUse
                onClose={function () {
                  hideModal();
                  _onCloseHook && _onCloseHook();
                }}
                className={dialogName || camelCase()}
                title={title}
                isOpen={isOpen}
                canEscapeKeyClose={false}
                canOutsideClickClose={false}
                {...extraDialogProps}
              >
                <WrappedComponent
                  {...{
                    ...rest,
                    fetchPolicy,
                    ssr: false,
                    hideModal
                  }}
                />
              </DialogToUse>
            )}
            {targetEl &&
              React.cloneElement(targetEl, {
                [onClickRename || "onClick"]: e => {
                  showModal();
                  if (noButtonClickPropagate) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }
              })}
          </React.Fragment>
        );
      }
    };
  }

  return compose(
    connect(({ tg_modalState }) => {
      return { ...topLevelDialogProps, tg_modalState };
    }),
    lifecycle({
      componentWillMount: function () {
        const { dispatch, dialogName } = this.props;
        const uniqueName = nanoid();
        const nameToUse = dialogName || uniqueName;
        this.setState({
          nameToUse,
          uniqueName
        });
        if (dialogName) {
          dispatch({
            type: "TG_REGISTER_MODAL",
            name: dialogName,
            uniqueName
          });
        }
      }
    }),
    connect(
      function ({ tg_modalState }, { nameToUse, uniqueName }) {
        const dialogState = tg_modalState[nameToUse] || {};
        const { open, __registeredAs, ...rest } = dialogState;
        const newProps = {
          ...rest,
          isDialogOpen:
            open &&
            (__registeredAs
              ? Object.keys(__registeredAs)[
                  Object.keys(__registeredAs).length - 1
                ] === uniqueName
              : true)
        };
        return newProps;
      },
      function (dispatch, { nameToUse, hideModal, showModal }) {
        return {
          showModal:
            showModal ||
            function () {
              dispatch({
                type: "TG_SHOW_MODAL",
                name: nameToUse
              });
            },
          hideModal:
            hideModal ||
            function () {
              dispatch({
                type: "TG_HIDE_MODAL",
                name: nameToUse
              });
            }
        };
      }
    ),
    dialogHoc
  );
}
