import React from "react";
import { Icon, Button, Tooltip } from "@blueprintjs/core";

export const viewColumn = {
  width: 35,
  noEllipsis: true,
  hideInMenu: true,
  immovable: true,
  type: "action",
  render: () => {
    return <Icon className="dt-eyeIcon" icon="eye-open" />;
  }
};
export const openColumn = ({ onDoubleClick, history }) => ({
  ...viewColumn,
  render: (val, record, rowInfo) => {
    return (
      <Tooltip content="Open">
        <Button
          onClick={e => {
            e.stopPropagation();
            onDoubleClick &&
              onDoubleClick(rowInfo.original, rowInfo.index, history);
          }}
          minimal
          small
          className="dt-eyeIcon"
          icon="document-open"
        />
      </Tooltip>
    );
  }
});
