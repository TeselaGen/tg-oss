import React from "react";
import IntentText from "../../../src/IntentText";
import DemoWrapper from "../DemoWrapper";
import WrappedCode from "../WrappedCode";

export default function IntentTextDemo() {
  return (
    <DemoWrapper>
      {["primary", "success", "danger", "warning"].map(intent => {
        return (
          <React.Fragment key={intent}>
            <IntentText intent={intent}>I am {intent}!</IntentText>
            <WrappedCode>
              {`<IntentText intent="${intent}">I am ${intent}!</IntentText>`}
            </WrappedCode>
            <br />
          </React.Fragment>
        );
      })}
    </DemoWrapper>
  );
}
