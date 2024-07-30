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
  columnindex,
  ...rest
}) => {
  const index = columnindex ?? -1;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `${index}`,
      disabled: immovable === "true"
    });

  const sortStyles = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      style={{ ...sortStyles, ...style }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={classNames("rt-th", className)}
      onClick={e => toggleSort && toggleSort(e)}
      role="columnheader"
      tabIndex="-1" // Resolves eslint issues without implementing keyboard navigation incorrectly
      columnindex={columnindex}
      index={index}
      {...rest}
    >
      {children}
    </div>
  );
};
