/* Copyright (C) 2018 TeselaGen Biotechnology, Inc. */
import React from "react";
import classNames from "classnames";
import "./style.css";
import { Tooltip } from "@blueprintjs/core";
import { getTagColorStyle } from "./utils/tagUtils";
import popoverOverflowModifiers from "./utils/popoverOverflowModifiers";

function Tag({
  name,
  color,
  tooltip,
  selected,
  secondarySelected,
  hasSelection,
  onDelete,
  onClick,
  clickable,
  doNotFillWidth,
  style = {}
}) {
  const sharedStyles = {
    ...getTagColorStyle(color).style,
    padding: "2px 5px"
  };
  const deleteButton = onDelete && (
    <span
      style={{
        ...sharedStyles,
        cursor: "pointer",
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3
      }}
      className="delete-tag-button"
      onClick={onDelete}
    >
      &#10005;
    </span>
  );

  let nameToUse = name;
  const nameTooLong = name.length > 40;
  if (nameTooLong) {
    nameToUse = name.slice(0, 40) + "...";
  }
  if (tooltip || nameTooLong) {
    const content = (
      <div>
        {nameTooLong ? (
          <div>
            {name}
            {tooltip ? ":" : null}
          </div>
        ) : null}
        {tooltip ? <div>{tooltip}</div> : null}
      </div>
    );
    nameToUse = (
      <Tooltip content={content} modifiers={popoverOverflowModifiers}>
        {nameToUse}
      </Tooltip>
    );
  }

  const tag = (
    <React.Fragment>
      <span
        onClick={onClick}
        className="tg-tag"
        style={{
          ...sharedStyles,
          // will stop tags from growing tall
          marginBottom: "auto",
          borderRadius: 3,
          whiteSpace: "nowrap",
          wordBreak: "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",

          ...(onClick && { cursor: "pointer" }),
          ...(onDelete && {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0
          }),
          ...(doNotFillWidth && { width: "fit-content" }),
          ...(clickable && { cursor: "pointer" }),
          ...style
        }}
      >
        {nameToUse}
      </span>
      {deleteButton}
    </React.Fragment>
  );

  if (hasSelection) {
    return (
      <div
        className={classNames("tag-selection", {
          selected,
          "secondary-selected": secondarySelected
        })}
      >
        {tag}
      </div>
    );
  } else {
    return tag;
  }
}

export default Tag;
