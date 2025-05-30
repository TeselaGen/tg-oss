import { Button, Tooltip } from "@blueprintjs/core";
import React, { useEffect, useState } from "react";
import { wrapDialog } from "../../../src";
import DemoWrapper from "../DemoWrapper";
const DelayedTooltipButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h6>Button that appears after 2 seconds:</h6>
      {showButton ? (
        <Button disabled data-tip="I appeared after 2 seconds!">
          Delayed Button
        </Button>
      ) : (
        <span>Button will appear in 2 seconds...</span>
      )}
    </div>
  );
};

export default function EllipsizedTextAutoTooltip() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div>
      <DemoWrapper>
        <h5>Set a data-tip attribute:</h5>

        <DelayedTooltipButton></DelayedTooltipButton>
        <code>{`<Button data-tip="I'm a tooltip">`}</code>
        <Button data-tip="I'm a tooltip that is reaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaalllllllly long">
          Hover me!
        </Button>
        <span>
          <Button
            disabled
            data-tip="I'm a tooltip that is reaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaallllllllyreaaaaaaaaaaaaaaaaalllllllly long"
          >
            I'm a disabled element with a working toolip!
          </Button>
        </span>
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

        <code>{`<Button data-title="I'm a tooltip that works like a title">`}</code>
        <Button
          data-title="I'm a tooltip that works like a title"
          title="I'm a tooltip that works like a title"
        >
          Hover me!
        </Button>
        <code>{`<Button data-title="I'm a tooltip that works like a title" data-avoid=".avoidMe">`}</code>
        <Button
          data-title="I'm a tooltip that works like a title"
          title="I'm a tooltip that works like a title"
          data-avoid=".avoidMe"
        >
          Hover me!
        </Button>
        <div
          style={{
            height: 100,
            width: 100,
            backgroundColor: "red"
          }}
          className="avoidMe"
        >
          avoid me
        </div>
        <Button
          data-title={`I'm a tooltip that works like a title
          
          zonk
          `}
          title={`I'm a tooltip that works like a title
          
          zonk
          `}
          data-avoid=".avoidMe"
        >
          Hover me!
        </Button>
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
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
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
