import React, { Component } from "react";
import { SortableContainer } from "react-sortable-hoc";

function CustomTheadComponent(props) {
  const headerColumns = props.children.props.children;
  return (
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
  );
}

const SortableCustomTheadComponent = SortableContainer(CustomTheadComponent);

class SortableColumns extends Component {
  shouldCancelStart = e => {
    const className = e.target.className;
    // if its an svg then it's a blueprint icon
    return (
      e.target instanceof SVGElement || className.indexOf("rt-resizer") > -1
    );
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.moveColumn({
      oldIndex,
      newIndex
    });
  };

  render() {
    return (
      <SortableCustomTheadComponent
        {...this.props}
        lockAxis="x"
        axis="x"
        distance={10}
        helperClass="above-dialog"
        shouldCancelStart={this.shouldCancelStart}
        onSortEnd={this.onSortEnd}
      />
    );
  }
}

export default SortableColumns;
