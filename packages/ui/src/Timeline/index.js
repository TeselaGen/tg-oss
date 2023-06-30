import React, { Component } from "react";
import PropTypes from "prop-types";
import "./style.css";

class Timeline extends Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.element)
  };

  render() {
    return (
      <div className="tg-timeline">
        {this.props.children.length > 1 && <div className="tg-timeline-line" />}
        {this.props.children}
      </div>
    );
  }
}

export { default as TimelineEvent } from "./TimelineEvent";

export default Timeline;
