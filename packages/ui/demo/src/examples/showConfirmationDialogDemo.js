import { Button, Intent } from "@blueprintjs/core";
import React from "react";
import showConfirmationDialog from "../../../src/showConfirmationDialog";
import DemoWrapper from "../DemoWrapper";
import OptionsSection from "../OptionsSection";
import { useToggle } from "../useToggle";

export default function Demo() {
  const [noCancel, noCancelComp] = useToggle({
    type: "noCancelButton",
    label: "No Cancel Button"
  });
  const [withThird, withThirdComp] = useToggle({
    type: "withThirdButton",
    label: "With Third Button"
  });
  const [withFourth, withFourthComp] = useToggle({
    type: "withFourthButton",
    label: "With Fourth Button"
  });
  return (
    <div>
      <OptionsSection>
        {noCancelComp}
        {withThirdComp}
        {withFourthComp}
      </OptionsSection>

      <DemoWrapper>
        <Button
          onClick={async function handleClick() {
            const confirm = await showConfirmationDialog({
              ...(withThird && {
                thirdButtonText: "Third Button",
                thirdButtonIntent: "primary"
              }),
              ...(withFourth && {
                fourthButtonText: "Fourth Button",
                fourthButtonIntent: "primary"
              }),
              noCancelButton: noCancel,
              text: "Are you sure you want to re-run this tool? Downstream tools with linked outputs will need to be re-run as well!",
              intent: Intent.DANGER, //applied to the right most confirm button
              confirmButtonText: "Yep!",
              cancelButtonText: "Nope", //pass null to make the cancel button disappear
              // cancelButtonText: null, //pass null to make the cancel button disappear
              canEscapeKeyCancel: true //this is false by default
            });
            console.info("confirm:", confirm);
            window.toastr.success(`confirm =  ${confirm}`);
          }}
          text="Do some action"
        />
      </DemoWrapper>
    </div>
  );
}
