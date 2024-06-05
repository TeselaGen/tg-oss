import "./style.css";

function Timeline(props) {
  return (
    <div className="tg-timeline">
      {props.children.length > 1 && <div className="tg-timeline-line" />}
      {props.children}
    </div>
  );
}

export { default as TimelineEvent } from "./TimelineEvent";

export default Timeline;
