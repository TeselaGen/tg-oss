import React from "react";
import { Card, Divider } from "@blueprintjs/core";
import DividerWithText from "../../../src/DividerWithText";

export default function BlueprintDividerDemo() {
  return (
    <div>
      <Card>
        <h3>Standard BP Divider</h3>
        <Divider></Divider>
        <h3>Basic Divider</h3>
        <p>A basic divider with no text</p>
        <DividerWithText />
        <p>Some content after the divider</p>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <h3>Divider with Text</h3>
        <p>A divider with text in the middle</p>
        <DividerWithText text="OR" />
        <p>Some content after the divider</p>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <h3>Divider with Custom Text</h3>
        <p>A divider with longer text</p>
        <DividerWithText text="Continue with other options" />
        <p>Some content after the divider</p>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <h3>Custom Styling</h3>
        <p>Custom styling applied to the divider</p>
        <DividerWithText
          text="CUSTOM STYLING"
          style={{ margin: "24px 0" }}
          className="custom-divider"
        />
        <p>Some content after the divider</p>
      </Card>

      <Card
        style={{ marginTop: 20, backgroundColor: "#30404D", color: "white" }}
        className="bp3-dark"
      >
        <h3>Dark Theme</h3>
        <p>Divider in dark theme</p>
        <DividerWithText />
        <p>Text divider in dark theme</p>
        <DividerWithText text="DARK THEME" />
        <p>Some content after the divider</p>
      </Card>
    </div>
  );
}
