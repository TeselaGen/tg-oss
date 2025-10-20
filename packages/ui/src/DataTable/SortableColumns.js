import React, { useState, useEffect } from "react";
import { MouseSensor, useSensor, useSensors, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove as dndArrayMove
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

const CustomTheadComponent = ({
  children: _children,
  className,
  moveColumn,
  sortedItemsFull,
  style
}) => {
  // We need to do this because react table gives the children wrapped
  // in another component
  const children = _children.props.children;
  const [sortedItems, setSortedItems] = useState(() =>
    children.map(c => {
      // Use the path as the ID for sorting instead of the index
      return c.props.path || c.key.split("-")[1];
    })
  );

  // Update local state when children change
  useEffect(() => {
    setSortedItems(children.map(c => c.props.path || c.key.split("-")[1]));
  }, [children]);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10
    }
  });

  const sensors = useSensors(mouseSensor);
  const handleDragEnd = event => {
    const { active, over } = event;

    if (!over || !active) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    // Update local state immediately for smooth UI
    // Use path ID directly instead of parsing as integer
    const oldPath = active.id;
    const newPath = over.id;
    const oldIndex = sortedItemsFull.indexOf(oldPath);
    const newIndex = sortedItemsFull.indexOf(newPath);
    const newSortedItems = dndArrayMove(sortedItemsFull, oldIndex, newIndex);
    setSortedItems(newSortedItems);

    // Pass to parent for persistence
    moveColumn({ oldIndex, newIndex });
  };

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
      sensors={sensors}
    >
      <div className={"rt-thead " + className} style={style}>
        <div className="rt-tr">
          <SortableContext
            items={sortedItems}
            strategy={horizontalListSortingStrategy}
          >
            {children}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
};

const SortableColumns = ({
  className,
  style,
  children,
  moveColumn,
  sortedItemsFull
}) => {
  const shouldCancelStart = e => {
    const className = e.target.className;
    // if its an svg then it's a blueprint icon
    return (
      e.target instanceof SVGElement || className.indexOf("rt-resizer") > -1
    );
  };

  return (
    <CustomTheadComponent
      className={className}
      style={style}
      sortedItemsFull={sortedItemsFull}
      moveColumn={moveColumn}
      helperClass="above-dialog"
      shouldCancelStart={shouldCancelStart}
    >
      {children}
    </CustomTheadComponent>
  );
};

export default SortableColumns;
