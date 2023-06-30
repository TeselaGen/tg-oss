import { Button, Tooltip } from "@blueprintjs/core";
import React, { useState } from "react";
import { wrapDialog } from "../../../src";
import DemoWrapper from "../DemoWrapper";

export default function EllipsizedTextAutoTooltip() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div>
      <DemoWrapper>
        <h5>Set a data-tip attribute:</h5>

        <code>{`<Button data-tip="I'm a tooltip">`}</code>
        <Button data-tip="I'm a tooltip that is reaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaalllllllly long">Hover me!</Button>
        <Tooltip content={"I'm a tooltip"}>
          <Button>Hover me!</Button>
        </Tooltip>
        <Button
          data-tip={`<strong>Bolded content</strong> <br></br><br></br><br></br> more content`}
        >
          Custom Html
        </Button>
        <Button text="Open Dialog" onClick={() => setOpen(true)} />
        {isOpen && (
          <MyDialog
            hideModal={() => {
              setOpen(false);
            }}
            isOpen={isOpen}
          ></MyDialog>
        )}
      </DemoWrapper>
      <br></br>
      <DemoWrapper>
        <h5>
          Or, set the following CSS styles on an element to get the following{" "}
          <br></br>
          tooltip auto-magically whenever text gets ellispized:{" "}
        </h5>
        <code>
          {`
//css-in-js
width: 190,
overflow: "hidden",
whiteSpace: "nowrap",
textOverflow: "ellipsis"`}
        </code>
        <code>
          {`
# pure css
width: 190,
overflow: "hidden",
whiteSpace: "nowrap",
textOverflow: "ellipsis"`}
        </code>
        <br></br>
        <br></br>
        <br></br>
        <div
          style={{
            width: 190,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis"
          }}
        >
          Hover me, I'm some long ellipsized text lalasdlfasdflkajsdfl I'm some
          long ellipsized text lalasdlfasdflkajsdflI'm some long ellipsized text
          lalasdlfasdflkajsdflI'm some long ellipsized text
          lalasdlfasdflkajsdflI'm some long ellipsized text lalasdlfasdflkajsdfl
        </div>
      </DemoWrapper>
    </div>
  );
}

function DialogInner() {
  return (
    <div>
      <Button data-tip="I'm a tooltip">Hover me!</Button>
      <div
        style={{
          width: 190,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis"
        }}
      >
        Hover me, I'm some long ellipsized text lalasdlfasdflkajsdfl I'm some
        long ellipsized text lalasdlfasdflkajsdflI'm some long ellipsized text
        lalasdlfasdflkajsdflI'm some long ellipsized text
        lalasdlfasdflkajsdflI'm some long ellipsized text lalasdlfasdflkajsdfl
      </div>
    </div>
  );
}
const MyDialog = wrapDialog({ title: "Dialog Demo" })(DialogInner);
