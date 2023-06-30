import React from "react";
import dayjs from "dayjs";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function TimelineEvent({ date, children }) {
  return (
    <div className="tg-timeline-event">
      <div
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <div className="tg-timeline-circle" />
        {children}
        <div
          style={{ marginLeft: 5 }}
          className={classNames(Classes.TEXT_SMALL, Classes.TEXT_MUTED)}
        >
          ({dayjs(date).fromNow()})
        </div>
      </div>
    </div>
  );
}

export default TimelineEvent;
