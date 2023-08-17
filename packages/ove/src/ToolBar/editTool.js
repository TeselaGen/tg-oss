import React, { useState } from "react";
import { Icon } from "@blueprintjs/core";
import ToolbarItem from "./ToolbarItem";
import { connectToEditor } from "../withEditorProps";

export default connectToEditor((editorState) => {
  return {
    readOnly: editorState.readOnly
  };
})(
  ({
    toolbarItemProps,
    readOnly,
    toggleReadOnlyMode,
    disableSetReadOnly,
    onChangeEditLock
  }) => {
    const [isLoading, setIsLoading] = useState(false);
    const readOnlyTooltip = ({ readOnly, disableSetReadOnly }) => {
      if (disableSetReadOnly) {
        return "You do not have permission to edit locks on this sequence";
      }
      return readOnly ? "Click to enable editing" : "Click to disable editing";
    };
    return (
      <ToolbarItem
        {...{
          disabled: isLoading || disableSetReadOnly,
          Icon: <Icon icon={readOnly ? "lock" : "unlock"} />,
          onIconClick: async () => {
            if (onChangeEditLock) {
              setIsLoading(true);
              await onChangeEditLock(!readOnly);
              setIsLoading(false);
            }
            toggleReadOnlyMode();
          },
          tooltip: readOnlyTooltip({ readOnly, disableSetReadOnly }),
          ...toolbarItemProps
        }}
      />
    );
  }
);
