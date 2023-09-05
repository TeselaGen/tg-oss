import React, { useState } from "react";
import { Icon } from "@blueprintjs/core";
import ToolbarItem from "./ToolbarItem";
import { connectToEditor } from "../withEditorProps";
import { func } from "prop-types";

export default connectToEditor(editorState => {
  return {
    readOnly: editorState.readOnly
  };
})(props => {
  const { toolbarItemProps, readOnly, disableSetReadOnly } = props;
  const [isLoading, setIsLoading] = useState(false);
  const readOnlyTooltip = ({ readOnly, disableSetReadOnly }) => {
    if (isLoading) {
      return "Loading...";
    } else if (disableSetReadOnly) {
      return "You do not have permission to edit locks on this sequence";
    }
    return readOnly ? "Click to enable editing" : "Click to disable editing";
  };
  return (
    <ToolbarItem
      {...{
        disabled: isLoading || disableSetReadOnly,
        Icon: <Icon icon={readOnly ? "lock" : "unlock"} />,
        onIconClick: () =>
          handleReadOnlyChange(!readOnly, { ...props, setIsLoading }),
        tooltip: readOnlyTooltip({ readOnly, disableSetReadOnly }),
        ...toolbarItemProps
      }}
    />
  );
});

export async function handleReadOnlyChange(
  newVal,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  { beforeReadOnlyChange, updateReadOnlyMode, setIsLoading = () => {} }
) {
  if (beforeReadOnlyChange) {
    setIsLoading(true);
    const shouldChange = await beforeReadOnlyChange(newVal);
    setIsLoading(false);
    if (shouldChange === false) {
      return;
    }
  }
  updateReadOnlyMode(newVal);
}
