import { Classes, Colors } from "@blueprintjs/core";
import React from "react";
import InfoHelper from "../../../src/InfoHelper";
import DemoWrapper from "../DemoWrapper";

function InfoHelperWithDemoLabel({ label, children }) {
  return (
    <DemoWrapper style={{ marginBottom: 10 }}>
      <div style={{ marginBottom: 10 }}>{label}</div>
      {children}
    </DemoWrapper>
  );
}

export default function InfoHelperDemo() {
  return (
    <div>
      <InfoHelperWithDemoLabel label="Default">
        <InfoHelper
          content={
            "Hey I'm some helpful info! And I'm some really long helpful info.. This should wrap lines"
          }
        />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label="As Button disabled">
        <InfoHelper isButton disabled content={"Hey I'm some helpful info!"} />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label="Inline">
        i am inline text
        <InfoHelper
          isInline
          color="red"
          content={"Hey I'm some helpful info!"}
        />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label="Display to side">
        <InfoHelper displayToSide content={"Hey I'm some helpful info!"} />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label="Clickable and Display to side">
        <InfoHelper
          displayToSide
          clickable
          content={"Hey I'm some helpful info!"}
        />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`As different icon (icon="align-left")`}>
        <InfoHelper icon="align-left" content={"Hey I'm some helpful info!"} />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`With color (color="blue")`}>
        <InfoHelper
          color="blue"
          icon="align-left"
          content={"Hey I'm some helpful info!"}
        />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`As Button (isButton=true)`}>
        <InfoHelper
          isButton
          intent="primary"
          text="Hello world!"
          icon="align-left"
          content={"Hey I'm some helpful info!"}
        />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`Change size (size=45)`}>
        <InfoHelper
          size={45}
          color="green"
          content={"Hey I'm some helpful info!"}
        />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`As a Popover (isPopover=true)`}>
        <InfoHelper isPopover content={"Hey I'm some helpful info!"} />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`Popover and change size (size=30)`}>
        <InfoHelper
          size={30}
          isPopover
          content={"Hey I'm some helpful info!"}
        />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`Large`}>
        <InfoHelper
          className={Classes.LARGE}
          isPopover
          content={"Hey I'm some helpful info!"}
        />
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`Absolute Position`}>
        <div
          style={{
            position: "relative",
            height: 300,
            width: 300,
            background: Colors.INDIGO5
          }}
        >
          <InfoHelper
            content={"Hey I'm some helpful info!"}
            style={{ position: "absolute", right: 0, bottom: 0 }}
          />
        </div>
      </InfoHelperWithDemoLabel>
      <InfoHelperWithDemoLabel label={`Long Info`}>
        <InfoHelper
          content={
            "Hey I'm some helpful info!  aiojeifj oiwjefia ofja iowjef aoiwejfoiajweif jawfo joaiwefjaiw faoiwjf ioawjef awoefijawioefj awofj oawjf oawj efojafoaj eofijawiofjaiw efaoiwjefoiawjioef aiojeifj oiwjefia ofja iowjef aoiwejfoiajweif jawfo joaiwefjaiw faoiwjf ioawjef awoefijawioefj awofj oawjf oawj efojafoaj eofijawiofjaiw efaoiwjefoiawjioef aiojeifj oiwjefia ofja iowjef aoiwejfoiajweif jawfo joaiwefjaiw faoiwjf ioawjef awoefijawioefj awofj oawjf oawj efojafoaj eofijawiofjaiw efaoiwjefoiawjioef aiojeifj oiwjefia ofja iowjef aoiwejfoiajweif jawfo joaiwefjaiw faoiwjf ioawjef awoefijawioefj awofj oawjf oawj efojafoaj eofijawiofjaiw efaoiwjefoiawjioef aiojeifj oiwjefia ofja iowjef aoiwejfoiajweif jawfo joaiwefjaiw faoiwjf ioawjef awoefijawioefj awofj oawjf oawj efojafoaj eofijawiofjaiw efaoiwjefoiawjioef aiojeifj oiwjefia ofja iowjef aoiwejfoiajweif jawfo joaiwefjaiw faoiwjf ioawjef awoefijawioefj awofj oawjf oawj efojafoaj eofijawiofjaiw efaoiwjefoiawjioef"
          }
        />
      </InfoHelperWithDemoLabel>
    </div>
  );
}
