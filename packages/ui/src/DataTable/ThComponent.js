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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: path,
    disabled: immovable === "true"
  });

  // Enhanced styles for dragging - more visible across the table
  const sortStyles = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
    // Add more pronounced visual feedback when dragging
    ...(isDragging && {
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      opacity: 0.85
    })
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
