import { Button } from "@blueprintjs/core";
import React from "react";
import {
  flaskIcon,
  orfIcon,
  removeDuplicatesIcon,
  featureIcon,
  dnaIcon,
  workqueueIcon,
  inventoryIcon,
  workflowIcon,
  strainIcon,
  designIcon,
  moleculeIcon,
  keyboardIcon,
  cardDetailsIcon,
  driveIcon,
  sharedDriveIcon,
  proteinIcon,
  tubeIcon,
  reverseFeatureIcon,
  bluntFeatureIcon
} from "../../../src/customIcons";
import DemoWrapper from "../DemoWrapper";

export default function CustomIconsDemo() {
  return (
    <DemoWrapper>
      <h3>Instuctions for adding more icons:</h3>
      <h4>
        open `src/customIcons.js` and add a new exported svg with a name of
        xxxxIcon (you can find the svgs from iconmonstr or flaticon or wherever)
      </h4>
      <h4>
        be sure to add it to the `demo/src/examples/CustomIcons.js` page to TEST
        THAT IT WORKS and so that people know it exists!
      </h4>
      <Button intent={"primary"} icon={flaskIcon} text="flaskIcon" />
      <Button icon={orfIcon} text="orfIcon" />
      <Button icon={removeDuplicatesIcon} text="removeDuplicatesIcon" />
      <Button icon="add" text="orfIcon" />
      <Button icon={featureIcon} text="featureIcon" />
      <Button icon={reverseFeatureIcon} text="reverseFeatureIcon" />
      <Button icon={bluntFeatureIcon} text="bluntFeatureIcon" />
      <Button icon={dnaIcon} text="dnaIcon" />
      <Button icon={workqueueIcon} text="workqueueIcon" />
      <Button icon={inventoryIcon} text="inventoryIcon" />
      <Button icon={workflowIcon} text="workflowIcon" />
      <Button icon={strainIcon} text="strainIcon" />
      <Button icon={designIcon} text="designIcon" />
      <Button icon={moleculeIcon} text="moleculeIcon" />
      <Button icon={keyboardIcon} text="keyboardIcon" />
      <Button icon={cardDetailsIcon} text="cardDetailsIcon" />
      <Button icon={driveIcon} text="driveIcon" />
      <Button icon={sharedDriveIcon} text="sharedDriveIcon" />
      <Button icon={proteinIcon} text="proteinIcon" />
      <Button icon={tubeIcon} text="tubeIcon" />
    </DemoWrapper>
  );
}
