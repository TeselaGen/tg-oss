import { Button } from "@blueprintjs/core";
import React from "react";
import CollapsibleCard from "../../../src/CollapsibleCard";
import DemoWrapper from "../DemoWrapper";

export default function CollapsibleCardDemo() {
  return (
    <DemoWrapper>
      <CollapsibleCard
        helperText={"Here is some helper text \n\n some new lines"}
        title="Jobs"
        openTitleElements={<Button text="hey" icon="add" />}
        icon="build"
      >
        I'm some content!
      </CollapsibleCard>
    </DemoWrapper>
  );
}
