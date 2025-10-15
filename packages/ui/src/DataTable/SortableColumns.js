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
  onSortEnd,
  onSortStart,
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

  const handleDragStart = event => {
    onSortStart();

    // Add a class to the active drag item for styling
    const { active } = event;
    if (active) {
      // Use a more specific selector for path-based attributes
      const activeNode = document.querySelector(`.rt-th[path="${active.id}"]`);
      if (activeNode) {
        activeNode.classList.add("th-dragging");
      }
    }
  };

  const handleDragEnd = event => {
    const { active, over } = event;

    // Remove the drag styling
    const draggingItem = document.querySelector(".rt-th.th-dragging");
    if (draggingItem) {
      draggingItem.classList.remove("th-dragging");
    }

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
    const oldIndex = sortedItems.indexOf(oldPath);
    const newIndex = sortedItems.indexOf(newPath);
    const newSortedItems = dndArrayMove(sortedItems, oldIndex, newIndex);
    setSortedItems(newSortedItems);

    // Pass to parent for persistence
    onSortEnd({ oldIndex, newIndex });
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
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

const SortableColumns = ({ className, style, children, moveColumn }) => {
  const shouldCancelStart = e => {
    const className = e.target.className;
    // if its an svg then it's a blueprint icon
    return (
      e.target instanceof SVGElement || className.indexOf("rt-resizer") > -1
    );
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    document.body.classList.remove("drag-active");
    moveColumn({
      oldIndex,
      newIndex
    });
  };

  const onSortStart = () => {
    document.body.classList.add("drag-active");
  };

  return (
    <CustomTheadComponent
      className={className}
      style={style}
      onSortStart={onSortStart}
      onSortEnd={onSortEnd}
      helperClass="above-dialog"
      shouldCancelStart={shouldCancelStart}
    >
      {children}
    </CustomTheadComponent>
  );
};

export default SortableColumns;
