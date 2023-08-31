import { Button, Classes } from "@blueprintjs/core";
import React from "react";
import { Component } from "react";
import renderToggle from "../renderToggle";
import ResizableDraggableDialog from "../../../src/ResizableDraggableDialog";
import { AdvancedOptions } from "../../../src";

export default class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      numberOfItems: 12
    };
  }

  render() {
    const arrayOfLength = Array.from({ length: this.state.numberOfItems }, () =>
      Math.floor(Math.random() * 9)
    );
    return (
      <div>
        {[1, 10, 20].map(n => (
          <Button
            key={n}
            onClick={() => {
              this.setState({ isOpen: true });
              this.setState({
                numberOfItems: n
              });
            }}
          >
            Open Dialog ({n} items)
          </Button>
        ))}
        {renderToggle({
          that: this,
          label: "Fixed Initial Height",
          type: "fixedHeightAndWidth"
        })}
        <br />
        <br />
        {this.state.isOpen && (
          <ResizableDraggableDialog
            isOpen={true}
            onClose={() => {
              this.setState({ isOpen: false });
            }}
            {...(this.state.fixedHeightAndWidth
              ? {
                  height: 300,
                  width: 300
                }
              : {})}
            title={"I'm Resizable and Draggable!"}
          >
            <div className={Classes.DIALOG_BODY}>
              I am a dialog
              <div>with a bunch of stuff in it</div>
              <AdvancedOptions>
                <button>hey</button>
                <br></br>
                <button>hey</button>
                <br></br>
                <button>hey</button>
                <button>hey</button>
              </AdvancedOptions>
              {arrayOfLength.map((num, i) => {
                return (
                  <div
                    key={i}
                    style={{ height: 40, background: Math.random() }}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </ResizableDraggableDialog>
        )}
      </div>
    );
  }
}
