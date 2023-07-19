import { Button } from "@blueprintjs/core";
import React from "react";
import DemoWrapper from "../DemoWrapper";

let showFirst = true;
export default function Demo() {
  return (
    <DemoWrapper>
      There is a one time set up to get the window.toastr object. All you need
      to do is add
      <br></br>
      <br></br>
      <code>import "@teselagen/ui"</code>
      <br></br>
      <br></br>
      in a top level file like /src/index and you'll have it
      <br></br>
      <br></br>
      <br></br>
      <Button
        intent="success"
        onClick={() => {
          window.toastr.success("heyy");
        }}
        text="show success toast"
      />
      <Button
        intent="success"
        onClick={() => {
          window.toastr.success("heyy", { className: "no-close-button" });
        }}
        text="show success toast without button to close"
      />
      <Button
        intent="primary"
        onClick={() => {
          window.toastr.info("heyy");
        }}
        text="show info toast"
      />
      <Button
        intent="warning"
        onClick={() => {
          window.toastr.warning("heyy");
        }}
        text="show warning toast"
      />
      <Button
        intent="danger"
        onClick={() => {
          window.toastr.error("heyy");
        }}
        text="show error toast"
      />
      <Button
        onClick={() => {
          if (showFirst) {
            window.toastr.info("Saving...", { key: "saveMsg" });
          } else {
            window.toastr.success("Saved", {
              updateTimeout: true,
              key: "saveMsg"
            });
          }
          showFirst = !showFirst;
        }}
        text="Click me once and click again to see that toast updated"
      ></Button>
      <div style={{ marginTop: 4000 }}>
        <Button
          intent="success"
          onClick={() => {
            window.toastr.success("i am still visible");
          }}
          text="show toast while scrolled"
        />
      </div>
    </DemoWrapper>
  );
}
