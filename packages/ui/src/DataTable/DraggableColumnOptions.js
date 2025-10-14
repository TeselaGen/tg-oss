import React, { useState, useEffect } from "react";
import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@blueprintjs/core";
import InfoHelper from "../InfoHelper";

const DraggableColumnOption = ({
  field,
  index,
  onVisibilityChange,
  numVisible
}) => {
  const { displayName, isHidden, isForcedHidden, path, subFrag } = field;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: path
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    marginBottom: 5
  };

  if (isForcedHidden) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="SortableItem"
      data-path={path}
      {...attributes}
      {...listeners}
    >
      <Checkbox
        name={`${path}-${index}`}
        key={index}
        onChange={() => {
          if (numVisible <= 1 && !isHidden) {
            return window.toastr.warning(
              "We have to display at least one column :)"
            );
          }
          onVisibilityChange({ shouldShow: isHidden, path });
        }}
        checked={!isHidden}
        label={
          <span style={{ display: "flex", marginTop: -17 }}>
            {displayName}
            {subFrag && (
              <InfoHelper
                icon="warning-sign"
                intent="warning"
                style={{ marginLeft: 5 }}
              >
                Viewing this column may cause the table to load slower
              </InfoHelper>
            )}
          </span>
        }
      />
    </div>
  );
};

const DraggableColumnOptions = ({
  fields,
  onVisibilityChange,
  onReorder,
  numVisible
}) => {
  const [sortedFields, setSortedFields] = useState(fields);

  // Update sorted fields when external fields change
  useEffect(() => {
    setSortedFields(fields);
  }, [fields]);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5
    }
  });

  const sensors = useSensors(mouseSensor);

  const handleDragStart = event => {
    // Add a class to the body to indicate dragging state
    document.body.classList.add("column-dragging");

    // Add a class to the active drag item
    const { active } = event;
    if (active) {
      const activeNode = document.querySelector(`[data-path="${active.id}"]`);
      if (activeNode) {
        activeNode.classList.add("dragging");
      }
    }
  };

  const handleDragEnd = event => {
    // Remove the dragging class
    document.body.classList.remove("column-dragging");

    // Remove the class from the active drag item
    const draggingItem = document.querySelector(".SortableItem.dragging");
    if (draggingItem) {
      draggingItem.classList.remove("dragging");
    }

    const { active, over } = event;

    if (!over || !active || active.id === over.id) {
      return;
    }

    const oldIndex = sortedFields.findIndex(f => f.path === active.id);
    const newIndex = sortedFields.findIndex(f => f.path === over.id);

    // Update the local state immediately for a smooth UI
    const newSortedFields = arrayMove(sortedFields, oldIndex, newIndex);
    setSortedFields(newSortedFields);

    // Notify parent component to persist the change
    onReorder({ oldIndex, newIndex });
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedFields.map(field => field.path)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {sortedFields.map((field, index) => (
            <DraggableColumnOption
              key={field.path || index}
              field={field}
              index={index}
              onVisibilityChange={onVisibilityChange}
              numVisible={numVisible}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableColumnOptions;
