import shortid from "shortid";

import { cloneDeep, startCase } from "lodash-es";
import { convertRangeTo1Based } from "@teselagen/range-utils";

export const dialogHolder = {};
//if an overrideName is passed, then that dialog can be overridden if an overriding dialog is passed as a prop to the <Editor/>
export function showDialog({
  ModalComponent,
  dialogType,
  props,
  overrideName
}) {
  dialogHolder.dialogType = dialogType;
  if (!dialogHolder.dialogType && ModalComponent) {
    dialogHolder.dialogType = "TGCustomModal";
  }

  dialogHolder.editorName = props?.editorName;
  // check if focused element in the dom is within a given editor and add an editor prop to the dialog
  if (document.activeElement && document.activeElement.closest(".veEditor")) {
    let editorName;
    document.activeElement
      .closest(".veEditor")
      ?.className.split(" ")
      .forEach(c => {
        if (!c.trim()) return;
        if (
          !c.trim().includes("veEditor") &&
          !c.trim().includes("previewModeFullscreen")
        ) {
          editorName = c;
        }
      });
    dialogHolder.editorName = editorName;
  }

  dialogHolder.CustomModalComponent = ModalComponent;
  dialogHolder.props = props;
  dialogHolder.overrideName = overrideName;
  if (dialogHolder.editorName && dialogHolder?.[dialogHolder.editorName]) {
    dialogHolder?.[dialogHolder.editorName]?.setUniqKeyToForceRerender?.(
      shortid()
    );
  } else {
    dialogHolder?.setUniqKeyToForceRerender?.(shortid());
  }
}
export function hideDialog() {
  delete dialogHolder.dialogType;
  delete dialogHolder.CustomModalComponent;
  delete dialogHolder.props;
  delete dialogHolder.overrideName;
  if (dialogHolder.editorName && dialogHolder?.[dialogHolder.editorName]) {
    dialogHolder?.[dialogHolder.editorName]?.setUniqKeyToForceRerender?.();
  } else {
    dialogHolder?.setUniqKeyToForceRerender?.();
  }
  delete dialogHolder.editorName;
}

const typeToDialogType = {
  part: "AddOrEditPartDialog",
  feature: "AddOrEditFeatureDialog",
  primer: "AddOrEditPrimerDialog"
};

export function showAddOrEditAnnotationDialog({
  type,
  annotation: _annotation
}) {
  // AddOrEditPartDialog
  // AddOrEditFeatureDialog
  // AddOrEditPrimerDialog
  const dialogType = typeToDialogType[type];
  if (Object.values(typeToDialogType).includes(dialogHolder.dialogType)) {
    return;
  }
  const nameUpper = startCase(type);
  const annotation = cloneDeep(_annotation);
  if (_annotation.isWrappedAddon) {
    delete annotation.isWrappedAddon;
    delete annotation.rangeTypeOverride;
    annotation.start = _annotation.end + 1;
    annotation.end = _annotation.start - 1;
  }
  const forward =
    annotation.strand === -1
      ? false
      : annotation.forward !== undefined
        ? !!annotation.forward
        : true;
  showDialog({
    overrideName: `AddOrEdit${nameUpper}DialogOverride`,
    dialogType,
    props: {
      ...(annotation.isEditLocked && {
        readOnly:
          typeof annotation.isEditLocked === "string"
            ? annotation.isEditLocked
            : "This annotation is locked"
      }),
      dialogProps: {
        title:
          annotation && annotation.id ? `Edit ${nameUpper}` : `New ${nameUpper}`
      },
      initialValues: {
        ...(annotation
          ? {
              ...convertRangeTo1Based(annotation),
              forward,
              arrowheadType:
                annotation.arrowheadType || (!forward ? "BOTTOM" : "TOP"),
              ...(annotation.locations && {
                locations: annotation.locations.map(convertRangeTo1Based)
              })
            }
          : {})
      }
    }
  });
}
