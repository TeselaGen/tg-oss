import React from "react";
import { Icon, Button, Tooltip } from "@blueprintjs/core";
import { reduce } from "lodash-es";

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

export const multiViewColumn = {
  ...viewColumn,
  columnHeader: ({ recordIdToIsVisibleMap, setRecordIdToIsVisibleMap }) => {
    const allVisible = reduce(
      recordIdToIsVisibleMap,
      (acc, val) => acc && val,
      true
    );
    return (
      <Tooltip content={allVisible ? "Hide All" : "Show All"}>
        <Button
          className={`showHideAllButton-${allVisible ? "visible" : "hidden"}`}
          minimal
          onClick={() => {
            setRecordIdToIsVisibleMap(
              reduce(
                recordIdToIsVisibleMap,
                (acc, val, key) => {
                  acc[key] = !allVisible;
                  return acc;
                },
                {}
              )
            );
          }}
          icon={allVisible ? "eye-open" : "eye-off"}
        />
      </Tooltip>
    );
  },
  render: (
    val,
    record,
    row,
    { recordIdToIsVisibleMap, setRecordIdToIsVisibleMap }
  ) => {
    if (!recordIdToIsVisibleMap) {
      return null;
    }
    const isVisible = recordIdToIsVisibleMap[record.id];
    return (
      <Tooltip content={isVisible ? "Hide" : "Show"}>
        <Button
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            setRecordIdToIsVisibleMap(
              Object.assign({}, recordIdToIsVisibleMap, {
                [record.id]: !isVisible
              })
            );
          }}
          minimal
          small
          className={`showHideButton-${isVisible ? "visible" : "hidden"}-${record.id}`}
          icon={isVisible ? "eye-open" : "eye-off"}
        />
      </Tooltip>
    );
  }
};
