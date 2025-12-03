import React from "react";
import AdvancedOptions from "../../../src/AdvancedOptions";
import DemoWrapper from "../DemoWrapper";
import WrappedCode from "../WrappedCode";

export default function AdvancedOptionsDemo() {
  return (
    <DemoWrapper>
      I'm some text lalala l
      <br />
      <br />
      <AdvancedOptions>I'm some more advanced options </AdvancedOptions>
      <br />
      <br />
      <br />
      <div>
        <WrappedCode>isOpenByDefault:</WrappedCode>
        <AdvancedOptions isOpenByDefault>
          I'm some more advanced options{" "}
        </AdvancedOptions>
      </div>
      <br />
      <br />
      <div>
        custom label (<WrappedCode>label="lalal"</WrappedCode>):
        <AdvancedOptions label="lalal">
          I'm some more advanced options{" "}
        </AdvancedOptions>
      </div>
      <br />
      <br />
      <div>
        With localStorageKey (
        <WrappedCode>localStorageKey="advanced-options-demo-key"</WrappedCode>):
        <AdvancedOptions localStorageKey="advanced-options-demo-key">
          I'm some more advanced options that should persist their open/closed
          state
        </AdvancedOptions>
      </div>
    </DemoWrapper>
  );
}
