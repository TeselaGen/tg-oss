import React, { ReactNode, FC } from "react";
import "./style.css";

interface TimelineProps {
  children: ReactNode;
}

const Timeline: FC<TimelineProps> = props => {
  return (
    <div className="tg-timeline">
      {React.Children.count(props.children) > 1 && (
        <div className="tg-timeline-line" />
      )}
      {props.children}
    </div>
  );
};

export { default as TimelineEvent } from "./TimelineEvent";

export default Timeline;
