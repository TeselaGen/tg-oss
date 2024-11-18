import React from "react";
import { MouseSensor, useSensor, useSensors, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy
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

    onSortEnd({
      oldIndex: parseInt(active.id),
      newIndex: parseInt(over.id)
    });
  };

  return (
    <DndContext
      onDragStart={onSortStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
      sensors={sensors}
    >
      <div className={"rt-thead " + className} style={style}>
        <div className="rt-tr">
          <SortableContext
            items={children.map((_, index) => `${index}`)}
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

  const onSortEnd = (...args) => {
    const { oldIndex, newIndex } = args[0];
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
