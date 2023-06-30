import React from "react";
import TimelineEvent from "../../../src/Timeline/TimelineEvent";
import Timeline from "../../../src/Timeline";
import DemoWrapper from "../DemoWrapper";

export default function TimeLineDemo() {
  return (
    <DemoWrapper>
      <Timeline>
        <TimelineEvent date={new Date()}>I am some content</TimelineEvent>
        <TimelineEvent date={new Date().setDate(new Date().getDate() - 4)}>
          I am more content
        </TimelineEvent>
        <TimelineEvent date={new Date(2017, 2, 2)}>
          I am even more content
        </TimelineEvent>
      </Timeline>
    </DemoWrapper>
  );
}
