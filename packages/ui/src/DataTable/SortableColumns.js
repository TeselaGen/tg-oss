import React, { Component } from "react";
import { MouseSensor, useSensor, useSensors, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

function CustomTheadComponent(props) {
  const headerColumns = props.children.props.children;
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10
    }
  });

  const sensors = useSensors(mouseSensor);
  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || !active) {
      return;
    }

    if (active.id === over.id) {
      return;
    }
    props.onSortEnd({
      oldIndex: parseInt(active.id),
      newIndex: parseInt(over.id)
    });
  }

  return (
    <DndContext
      onDragStart={props.onSortStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
      sensors={sensors}
    >
      <SortableContext
        items={headerColumns.map((_item, index) => `${index}`)}
        strategy={horizontalListSortingStrategy}
      >
        <div className={"rt-thead " + props.className} style={props.style}>
          <div className="rt-tr">
            {headerColumns.map(column => {
              // if a column is marked as immovable just return regular column
              if (column.props.immovable === "true") return column;
              // keeps track of hidden columns here so columnIndex might not equal i
              return column;
            })}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}

class SortableColumns extends Component {
  shouldCancelStart = e => {
    const className = e.target.className;
    // if its an svg then it's a blueprint icon
    return (
      e.target instanceof SVGElement || className.indexOf("rt-resizer") > -1
    );
  };

  onSortEnd = (...args) => {
    const { oldIndex, newIndex } = args[0];
    document.body.classList.remove("drag-active");
    this.props.moveColumn({
      oldIndex,
      newIndex
    });
  };

  onSortStart = () => {
    document.body.classList.add("drag-active");
  };

  render() {
    return (
      <CustomTheadComponent
        {...this.props}
        onSortStart={this.onSortStart}
        onSortEnd={this.onSortEnd}
        helperClass="above-dialog"
        shouldCancelStart={this.shouldCancelStart}
      />
    );
  }
}

export default SortableColumns;
