import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";

export const ThComponent = ({
  toggleSort,
  immovable,
  className,
  children,
  style,
  path,
  columnindex,
  ...rest
}) => {
  const index = columnindex ? path : -1;
  const disabled = !path || immovable === "true" || immovable === true;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: _isDragging
  } = useSortable({
    id: path,
    disabled
  });
  const isDragging = _isDragging && !disabled;
  if (transform) {
    transform.scaleX = 1; // Prevent column header from shrinking/expanding during drag (looks bad)
  }
  const sortStyles = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined
  };

  return (
    <div
      style={{ ...sortStyles, ...style }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={classNames("rt-th", className, { "th-dragging": isDragging })}
      onClick={e => toggleSort && toggleSort(e)}
      role="columnheader"
      tabIndex="-1" // Resolves eslint issues without implementing keyboard navigation incorrectly
      columnindex={columnindex}
      path={path}
      index={index}
      {...rest}
    >
      {children}
    </div>
  );
};
